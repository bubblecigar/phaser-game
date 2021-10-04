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

const createRoom = (roomId) => {
  if (rooms[roomId]) {
    return rooms[roomId]
  }
  rooms[roomId] = {
    id: roomId,
    players: [],
    items: [],
    disconnectedPlayers: [],
    idleTime: 0,
    gameStatus: null, // -> waiting -> processing -> ending -> waiting
    intervals: {
      alltime: [registerRoomAutoCloseInterval(roomId)],
      byGameStatus: []
    },
    methods: null
  }

  const room = rooms[roomId]
  room.methods = {
    writePlayer: (playerState) => {
      const playerIndex = room.players.findIndex(player => player.id === playerState.id)
      if (playerIndex > -1) {
        room.players[playerIndex] = playerState
      } else {
        room.players.push(playerState)
      }
    },
    syncAllClients: (sceneKey) => {
      const { io } = require('./index.js')
      io.in(roomId).emit(sceneKey, 'syncServerStateToClient', getEmittableFieldofRoom(room))
    },
    collectItem: (itemId) => {
      const itemIndex = room.items.findIndex(item => item.id === itemId)
      if (itemIndex < 0) {
        // already been collected by other player or the items may not be generated by server
      } else {
        // collect effect 
        room.items.splice(itemIndex, 1)
      }
    }
  }

  changeGameStatus(roomId, 'waiting')

  return room
}

const registerWaitingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]
    // check players ready state 
    // -> emit game start event 
    // -> change game status to processing
  }, 1000
)

const registerProcessingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]
    // emit game mechanism events (spawn monsters and items)
    // check end game condition
    // -> emit game end event
    // -> change game status to ending
  }, 1000
)

const registerEndingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]
    // generate end game report
    // -> emit end game report to clients
    // -> setTimeout and cycle gameStatus to waiting
  }, 1000
)

const changeGameStatus = (roomId, newGameStatus) => {
  const room = rooms[roomId]
  const gameStatusIntervals = room.intervals.byGameStatus
  gameStatusIntervals.forEach(interval => clearInterval(interval))
  gameStatusIntervals.splice(0, gameStatusIntervals.length)

  if (newGameStatus === 'waiting') {
    gameStatusIntervals.push(registerWaitingIntervals(roomId))
  } else if (newGameStatus === 'processing') {
    gameStatusIntervals.push(registerProcessingIntervals(roomId))
  } else if (newGameStatus === 'ending') {
    gameStatusIntervals.push(registerEndingIntervals(roomId))
  } else {
    // throw
  }

  room.gameStatus = newGameStatus
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

const connectToRoom = (roomId, userId, socket) => {
  socket.join(roomId)

  const room = rooms[roomId] || createRoom(roomId)
  reconnectPlayer(room, userId)

  return rooms[roomId]
}

const disconnectFromRoom = (roomId, userId, socket) => {
  socket.rooms.forEach(
    id => {
      if (id !== socket.id) {
        socket.leave(id)
      }
    }
  )
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

const getEmittableFieldofRoom = (room) => {
  const {
    players,
    items,
    gameStatus
  } = room

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
  getEmittableFieldofRoom
}