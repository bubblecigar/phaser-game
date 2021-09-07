const uuid = require('uuid')
const rooms = {}
const eventSchedules = {}



const createRoom = (roomId, io) => {
  if (rooms[roomId]) {
    console.log('room already exist')
    return
  }
  rooms[roomId] = {
    players: [],
    items: [],
    mapConfigKey: 'waitingRoomConfig',
    monsters: [],
    itemLayer: null
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

  const createCoinIntervalId = setInterval(
    createCoin, 1000
  )

  eventSchedules[roomId] = {
    io,
    createCoinIntervalId
    // endGameDetectionId: endGameDetectionId
  }
}

const joinRoom = (roomId, io) => {
  const gameStateOfRoom = rooms[roomId]
  if (!gameStateOfRoom) {
    createRoom(roomId, io)
  }
  return rooms[roomId]
}

const leaveRoom = (roomId, userId) => {
  const room = rooms[roomId]
  if (!room) {
    return
  }
  const playerIndex = room.players.findIndex(player => player.id === userId)
  if (playerIndex > -1) {
    room.players.splice(playerIndex, 1)
  } else {
    // do nothing
  }
  if (rooms[roomId].players.length) {
    // non empty room
  } else {
    delete rooms[roomId]
    clearInterval(eventSchedules[roomId].createCoinIntervalId)
    delete eventSchedules[roomId]
  }
}

exports.rooms = {
  joinRoom,
  leaveRoom
}