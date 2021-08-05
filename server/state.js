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
    mapConfigKey: 'waitingRoomConfig',
    monsters: []
  }
  const room = rooms[roomId]
  eventSchedules[roomId] = {
    io,
    monsterTimeout: setTimeout(() => {
      const monsterConstructor = {
        interface: 'Monster',
        id: uuid.v4(),
        velocity: { x: 0, y: 0 },
        position: { x: 200, y: 200 },
        charactorKey: 'orge',
        health: 100
      }
      room.monsters.push(monsterConstructor)
      io.in(roomId).emit('broadcast', 'createMonster', monsterConstructor)
    }, 1000)
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
    clearInterval(eventSchedules[roomId].monsterTimeout)
    delete eventSchedules[roomId]
  }
}

exports.rooms = {
  joinRoom,
  leaveRoom
}