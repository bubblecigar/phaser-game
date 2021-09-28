const uuid = require('uuid')
const setting = require('../share/setting.json')
const rooms = {}

// const checkWinner = room => {
//   const winner = room.players.find(
//     player => player.coins >= setting.coinsToWin
//   )
//   return winner
// }


// const createCoin = () => {
//   // const itemLayer = rooms[roomId].itemLayer
//   // if (!itemLayer) {
//   //   return
//   // }
//   // const coinPoints = itemLayer.objects.filter(o => o.name === 'coin_point')
//   // const randomCoinSpawnIndex = Math.floor(Math.random() * (coinPoints.length))
//   // const coinSpawnPoint = coinPoints[randomCoinSpawnIndex]
//   // if (!coinSpawnPoint) {
//   //   return
//   // }
//   const itemConstructor = {
//     interface: 'Item',
//     id: uuid(),
//     itemKey: 'coin',
//     position: { x: 150, y: 400 },
//     velocity: { x: 0, y: 0 },
//     phaserObject: null
//   }
//   rooms[roomId].items.push(itemConstructor)
//   io.in(roomId).emit('dungeon', 'addItem', itemConstructor)
// }

// const createCoinInterval = setInterval(
//   () => {
//     if (rooms[roomId].items.length === 0) {
//       createCoin()
//     }
//   }, 1000
// )


// const endGameDetectionInterval = setInterval(
//   () => {
//     const winner = checkWinner(rooms[roomId])
//   }, 1000
// )

// rooms[roomId].intervals.intervals.push(createCoinInterval)
// rooms[roomId].intervals.intervals.push(checkRoomIdleInterval)
// rooms[roomId].intervals.intervals.push(endGameDetectionInterval)


const closeRoom = (roomId) => {
  const room = rooms[roomId]
  Object.keys(room.intervals).forEach(
    prop => {
      room.intervals[prop].forEach(
        interval => {
          clearInterval(interval)
        }
      )
    }
  )
  delete rooms[roomId]
}

const registerRoomAutoCloseInterval = (roomId) => setInterval(
  () => {
    const room = rooms[roomId]
    if (room.players.length > 0) {
      // room in use
      room.idleTime = 0
    } else {
      // room in idle
      if (room.idleTime >= setting.roomAutoCloseIdleTime) {
        closeRoom(roomId)
      }
      room.idleTime += 1000
    }
  }, 1000
)

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
    gameStatus: 'waiting', // waiting -> processing -> ending -> waiting
    intervals: {
      alltime: [registerRoomAutoCloseInterval(roomId)],
      byGameStatus: []
    }
  }

  return rooms[roomId]
}

const changeGameStatus = (roomId, newGameStatus) => {
  const room = rooms[roomId]
  room.intervals.byGameStatus.forEach(interval => clearInterval(interval))
  room.intervals.byGameStatus = []

  if (newGameStatus === 'waiting') {
    // check players ready state 
    // -> emit game start event 
    // -> change game status to processing
  }
  if (newGameStatus === 'processing') {
    // emit game mechanism events (spawn monsters and items)
    // check end game condition
    // -> emit game end event
    // -> change game status to ending
  }
  if (newGameStatus === 'ending') {
    // generate end game report
    // -> emit end game report to clients
    // -> setTimeout and cycle gameStatus to waiting
  }

  // emit to clients to inform gameStatus change
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

const getRoomState = (roomId) => {
  const room = rooms[roomId]
  if (!room) {
    return null
  }
  const {
    players,
    items,
    gameStatus
  } = rooms[roomId]

  return {
    players,
    items,
    gameStatus
  }
}

exports.rooms = {
  createRoom,
  connectToRoom,
  disconnectFromRoom,
  getRoomState
}