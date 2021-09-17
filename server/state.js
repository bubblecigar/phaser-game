const uuid = require('uuid')
const setting = require('../share/setting.json')
const rooms = {}
const eventSchedules = {}

const createRoom = (roomId, io, itemLayer) => {
  if (rooms[roomId]) {
    return rooms[roomId]
  }
  rooms[roomId] = {
    players: [],
    items: [],
    mapConfigKey: 'waitingRoomConfig',
    monsters: [],
    itemLayer,
    disconnectedPlayers: [],
    idleTime: 0
  }

  const createCoin = () => {
    const itemLayer = rooms[roomId].itemLayer
    if (!itemLayer) {
      return
    }
    const coinPoints = itemLayer.objects.filter(o => o.name === 'coin_point')
    const randomCoinSpawnIndex = Math.floor(Math.random() * (coinPoints.length))
    const coinSpawnPoint = coinPoints[randomCoinSpawnIndex]
    const itemConstructor = {
      interface: 'Item',
      id: uuid(),
      itemKey: 'coin',
      position: { x: coinSpawnPoint.x, y: coinSpawnPoint.y },
      velocity: { x: 0, y: 0 },
      phaserObject: null
    }
    rooms[roomId].items.push(itemConstructor)
    io.in(roomId).emit('broadcast', 'addItem', itemConstructor)
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

  eventSchedules[roomId] = {
    io,
    createCoinInterval,
    checkRoomIdleInterval
  }

  return rooms[roomId]
}

// create player on spawn_point
const createPlayer = (room, userId) => {
  const spawnPoints = room.itemLayer.objects.filter(o => o.name === 'spawn_point')
  const spawnPoint = spawnPoints ? spawnPoints[0] : { x: 100, y: 100 }
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

const connectToRoom = (roomId, userId) => {
  const room = rooms[roomId]
  if (!room) {
    return console.log('room not exists.... it should not happened...')
  }
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
  clearInterval(eventSchedules[roomId].createCoinInterval)
  clearInterval(eventSchedules[roomId].checkRoomIdleInterval)
  delete eventSchedules[roomId]
}

exports.rooms = {
  createRoom,
  connectToRoom,
  disconnectFromRoom
}