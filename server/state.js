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
    coins: [],
    mapConfigKey: 'waitingRoomConfig',
    monsters: []
  }

  const retainOneCoin = () => {
    if (rooms[roomId].coins.length > 0) {
      return
    } else {
      createCoin()
    }
  }

  const createCoin = () => {
    const coinConstructor = {
      id: uuid(),
      itemKey: 'coin',
      randomValue: Math.random()
    }
    rooms[roomId].coins.push(coinConstructor)
    io.in(roomId).emit('broadcast', 'addCoin', coinConstructor)
  }

  const createCoinIntervalId = setInterval(
    retainOneCoin, 1000
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