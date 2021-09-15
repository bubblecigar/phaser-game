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
    itemLayer: null,
    onConnectionIds: []
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
    () => {
      if (rooms[roomId].items.length === 0) {
        createCoin()
      }
    }, 1000
  )

  eventSchedules[roomId] = {
    io,
    createCoinIntervalId
    // endGameDetectionId: endGameDetectionId
  }
}

const connectToRoom = (roomId, io, userId) => {
  const gameStateOfRoom = rooms[roomId]
  if (!gameStateOfRoom) {
    createRoom(roomId, io)
  }
  const room = rooms[roomId]
  const index = room.onConnectionIds.findIndex(id => id === userId)
  if (index === -1) {
    rooms[roomId].onConnectionIds.push(userId)
  }
  return rooms[roomId]
}

const disconnectFromRoom = (roomId, userId) => {
  const room = rooms[roomId]
  if (!room) {
    return // room already closed
  }
  const index = room.onConnectionIds.findIndex(id => id === userId)
  if (index > -1) {
    room.onConnectionIds.splice(index, 1)
  }
  if (room.onConnectionIds.length === 0) {
    delete rooms[roomId]
    clearInterval(eventSchedules[roomId].createCoinIntervalId)
    delete eventSchedules[roomId]
  }
}

exports.rooms = {
  connectToRoom,
  disconnectFromRoom
}