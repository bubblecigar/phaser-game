const uuid = require('uuid')
const setting = require('../share/setting.json')
const rooms = {}
const eventSchedules = {}


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
    monsters: [],
    disconnectedPlayers: [],
    idleTime: 0
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
    io.in(roomId).emit('clients', 'addItem', itemConstructor)
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

  eventSchedules[roomId] = {
    io,
    intervals: [
      createCoinInterval,
      checkRoomIdleInterval,
      endGameDetectionInterval
    ]
  }

  return rooms[roomId]
}

// create player on spawn_point
const createPlayer = (room, userId) => {
  // const spawnPoints = room.itemLayer.objects.filter(o => o.name === 'spawn_point')
  // const spawnPoint = spawnPoints ? spawnPoints[0] : { x: 100, y: 100 }
  const spawnPoint = { x: 100, y: 300 }
  const playerConstructor = {
    interface: 'Player',
    id: userId,
    charactorKey: setting.initCharactor,
    position: { x: spawnPoint.x, y: spawnPoint.y },
    velocity: { x: 0, y: 0 },
    health: setting.initHealth,
    resurrectCountDown: setting.resurrectCountDown,
    coins: 0,
    items: [],
    bullet: 'arrow',
    abilities: null,
    phaserObject: null
  }
  room.players.push(playerConstructor)
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
  const reconnectSuccess = reconnectPlayer(room, userId)
  if (!reconnectSuccess) {
    createPlayer(room, userId)
  }
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
  delete rooms[roomId]

  eventSchedules[roomId].intervals.forEach(
    interval => {
      clearInterval(interval)
    }
  )
  delete eventSchedules[roomId]
}

const getRoomState = (roomId) => {
  return rooms[roomId]
}

exports.rooms = {
  createRoom,
  connectToRoom,
  disconnectFromRoom,
  getRoomState
}