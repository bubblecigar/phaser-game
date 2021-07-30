const rooms = {}

const createRoom = roomId => {
  if (rooms[roomId]) {
    console.log('room already exist')
    return
  }
  rooms[roomId] = {
    players: []
  }
}

const joinRoom = roomId => {
  const gameStateOfRoom = rooms[roomId]
  if (!gameStateOfRoom) {
    createRoom(roomId)
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
  }
}

exports.rooms = {
  joinRoom,
  leaveRoom
}