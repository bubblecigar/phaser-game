const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const rooms = {}

const intervalTimeStep = 200

// const checkWinner = room => {
//   const winner = room.players.find(
//     player => player.coins >= setting.coinsToWin
//   )
//   return winner
// }

// const endGameDetectionInterval = setInterval(
//   () => {
//     const winner = checkWinner(rooms[roomId])
//   }, intervalTimeStep
// )

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
      room.idleTime += intervalTimeStep
    }
  }, intervalTimeStep
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
    allPlayerReadyTime: 0,
    gameStatus: 'waiting', // -> waiting -> processing -> ending -> waiting
    intervals: {
      alltime: [registerRoomAutoCloseInterval(roomId)],
      byGameStatus: [registerWaitingIntervals(roomId)]
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
      io.in(roomId).emit(sceneKey, 'syncServerStateToClient', getEmittableFieldOfRoom(room))
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

  return room
}

const registerWaitingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]
    const allPlayerReady = !room.players.some(player => !player.ready)
    const enoughPlayers = room.players.length >= setting.minumumPlayers
    const readyForEnoughTime = room.allPlayerReadyTime >= setting.gameStartCountDown
    if (enoughPlayers && allPlayerReady) {
      if (readyForEnoughTime) {
        room.allPlayerReadyTime = 0
        changeGameStatus(roomId, 'processing')
      } else {
        room.allPlayerReadyTime += intervalTimeStep
      }
    } else {
      room.allPlayerReadyTime = 0
    }
  }, intervalTimeStep
)

const createCoin = () => {
  const mapFile = serverMap.processing.map
  const mapUrl = `../share/map/${mapFile}`
  const map = require(mapUrl)
  const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
  const coinSpawnPoints = infoLayer.objects.filter(object => object.name === 'coin_point')
  const randomCoinSpawnIndex = Math.floor(Math.random() * (coinSpawnPoints.length))
  const coinSpawnPoint = coinSpawnPoints[randomCoinSpawnIndex]
  const coinConstructor = {
    interface: 'Item',
    id: uuid(),
    itemKey: 'coin',
    position: { x: coinSpawnPoint.x, y: coinSpawnPoint.y },
    velocity: { x: 0, y: 0 },
    phaserObject: null
  }
  return coinConstructor
}

const registerProcessingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]

    const coins = room.items.filter(item => item.itemKey === 'coin')
    if (coins.length > 0) {
      // do nothing
    } else {
      const coinConstructor = createCoin()
      room.items.push(coinConstructor)
      const { io } = require('./index.js')
      io.in(roomId).emit('dungeon', 'addItem', coinConstructor)
    }

    // check end game condition
    // -> emit game end event
    // -> change game status to ending
  }, intervalTimeStep
)

const registerEndingIntervals = roomId => setInterval(
  () => {
    const room = rooms[roomId]
    // generate end game report
    // -> emit end game report to clients
    // -> setTimeout and cycle gameStatus to waiting
  }, intervalTimeStep
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
    // wrong status, throw
  }

  room.gameStatus = newGameStatus
  const { io } = require('./index.js')
  io.to(roomId).emit('game', 'updateGameStatus', room.gameStatus)
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
  const reconnectSuccess = reconnectPlayer(room, userId)

  if (!reconnectSuccess) {
    const mapFile = serverMap.waiting.map
    const mapUrl = `../share/map/${mapFile}`
    const map = require(mapUrl)
    const infoLayer = map.layers.find(o => o.name === 'info_layer')
    const spawnPoint = infoLayer.objects.find(o => o.name === 'spawn_point')
    const initHealth = setting.initHealth
    const playerConstructor = {
      interface: 'Player',
      id: userId,
      ready: false,
      scene: 'waitingRoom',
      charactorKey: setting.initCharactor,
      position: { x: spawnPoint.x, y: spawnPoint.y },
      velocity: { x: 0, y: 0 },
      health: initHealth,
      resurrectCountDown: setting.resurrectCountDown,
      coins: 0,
      items: [],
      bullet: 'arrow',
      abilities: null,
      phaserObject: null
    }
    room.players.push(playerConstructor)
  }

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

const getEmittableFieldOfRoom = (room) => {
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
  getEmittableFieldOfRoom
}