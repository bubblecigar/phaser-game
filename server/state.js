const uuid = require('uuid')
const setting = require('../share/setting.json')
const rooms = {}

const checkWinner = room => {
  const winner = room.players.find(
    player => player.coins >= setting.coinsToWin
  )
  return winner
}

const createRoom = (roomId, io) => {
  if (rooms[roomId]) {
    return rooms[roomId]
  }
  rooms[roomId] = {
    players: [],
    items: [],
    mapConfigKey: 'waitingRoomConfig',
    disconnectedPlayers: [],
    idleTime: 0,
    eventSchedules: {
      intervals: []
    }
  }

  const createCoin = () => {
    // const itemLayer = rooms[roomId].itemLayer
    // if (!itemLayer) {
    //   return
    // }
    // const coinPoints = itemLayer.objects.filter(o => o.name === 'coin_point')
    // const randomCoinSpawnIndex = Math.floor(Math.random() * (coinPoints.length))
    // const coinSpawnPoint = coinPoints[randomCoinSpawnIndex]
    // if (!coinSpawnPoint) {
    //   return
    // }
    const itemConstructor = {
      interface: 'Item',
      id: uuid(),
      itemKey: 'coin',
      position: { x: 150, y: 400 },
      velocity: { x: 0, y: 0 },
      phaserObject: null
    }
    rooms[roomId].items.push(itemConstructor)
    io.in(roomId).emit('dungeon', 'addItem', itemConstructor)
  }

  const createCoinInterval = setInterval(
    () => {
      if (rooms[roomId].items.length === 0) {
        createCoin()
      }
    }, 1000
  )

  const checkRoomIdleInterval = setInterval(
    () => {
      if (rooms[roomId].players.length > 0) {
        // room in use
        rooms[roomId].idleTime = 0
      } else {
        // room in idle
        rooms[roomId].idleTime += 1000
        if (rooms[roomId].idleTime >= 60000) {
          closeRoom(roomId)
        }
      }
    }, 1000
  )

  const endGameDetectionInterval = setInterval(
    () => {
      const winner = checkWinner(rooms[roomId])
    }, 1000
  )

  rooms[roomId].eventSchedules.intervals.push(createCoinInterval)
  rooms[roomId].eventSchedules.intervals.push(checkRoomIdleInterval)
  rooms[roomId].eventSchedules.intervals.push(endGameDetectionInterval)

  return rooms[roomId]
}

const reconnectPlayer = (room, userId) => {
  const index = room.disconnectedPlayers.findIndex(player => player.id === userId)
  if (index !== -1) { // reconnect
    room.players.push(room.disconnectedPlayers[index])
    room.disconnectedPlayers.splice(index, 1)
    return true
  }
  return false
}

const connectToRoom = (roomId, userId, io, socket) => {
  socket.rooms.forEach(
    id => {
      if (id !== socket.id) {
        socket.leave(id)
      }
    }
  )
  socket.join(roomId)

  const room = rooms[roomId] || createRoom(roomId, io)
  reconnectPlayer(room, userId)

  return rooms[roomId]
}

const disconnectFromRoom = (roomId, userId) => {
  const room = rooms[roomId]
  if (!room) {
    return // room already closed
  }
  const index = room.players.findIndex(player => player.id === userId)
  if (index > -1) {
    room.disconnectedPlayers.push(room.players[index])
    room.players.splice(index, 1)
  }
}

const closeRoom = (roomId) => {
  rooms[roomId].eventSchedules.intervals.forEach(
    interval => {
      clearInterval(interval)
    }
  )
  delete rooms[roomId]
}

const getRoomState = (roomId) => {
  const room = rooms[roomId]
  if (!room) {
    return null
  }
  const {
    players,
    items,
    mapConfigKey
  } = rooms[roomId]

  return {
    mapConfigKey,
    players,
    items
  }
}

exports.rooms = {
  createRoom,
  connectToRoom,
  disconnectFromRoom,
  getRoomState
}