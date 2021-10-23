const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')

const intervalTimeStep = 200

const registerRoomAutoCloseInterval = room => setInterval(
  () => {
    const roomIsInUse = room.players.length > 0
    if (roomIsInUse) {
      room.idleTime = 0
    } else {
      const idleForTooLong = room.idleTime >= setting.roomAutoCloseIdleTime
      if (idleForTooLong) {
        const roomMethods = require('./rooms').roomMethods
        roomMethods.closeRoom(room.id)
      } else {
        room.idleTime += intervalTimeStep
      }
    }
  }, intervalTimeStep
)

const registerWaitingIntervals = room => setInterval(
  () => {
    const allPlayerReady = !room.players.some(player => !player.ready)
    const enoughPlayers = room.players.length >= setting.minumumPlayers
    const readyForEnoughTime = room.allPlayerReadyTime >= setting.gameStartCountDown
    if (enoughPlayers && allPlayerReady) {
      if (readyForEnoughTime) {
        room.allPlayerReadyTime = 0
        changeGameStatus(room, 'processing')
      } else {
        room.allPlayerReadyTime += intervalTimeStep
        const { io } = require('./index.js')
        io.in(room.id).emit('game', 'gameStartCountDown', setting.gameStartCountDown - room.allPlayerReadyTime)
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
    builderId: 'server',
    itemKey: 'coin',
    position: { x: coinSpawnPoint.x, y: coinSpawnPoint.y },
    velocity: { x: 0, y: 0 },
    phaserObject: null
  }
  return coinConstructor
}

const createMonster = () => {
  const mapFile = serverMap.processing.map
  const mapUrl = `../share/map/${mapFile}`
  const map = require(mapUrl)
  const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
  const monsterSpawnPoints = infoLayer.objects.filter(object => object.name === 'monster_point')
  const monsterSpawnPoint = monsterSpawnPoints[0]
  const monsterConstructor = {
    interface: 'Monster',
    id: uuid(),
    health: 100,
    builderId: 'server',
    charactorKey: 'orge',
    drop: 'coin',
    position: { x: monsterSpawnPoint.x, y: monsterSpawnPoint.y },
    velocity: { x: 0, y: 0 },
    phaserObject: null
  }
  return monsterConstructor
}

const detectWinners = room => {
  const winners = []
  room.players.forEach(
    player => {
      if (player.coins >= setting.coinsToWin) {
        winners.push(player)
      }
    }
  )
  return winners
}

const registerProcessingIntervals = room => setInterval(
  () => {
    const serverSpawnCoins = room.items.filter(
      item => item.itemKey === 'coin' && item.builderId === 'server'
    )
    if (serverSpawnCoins.length > 0) {
      room.coinSpawnTime = 0
    } else {
      if (room.coinSpawnTime >= setting.coinSpawnInterval) {
        const coinConstructor = createCoin()
        room.items.push(coinConstructor)
        const { io } = require('./index.js')
        io.in(room.id).emit('dungeon', 'addItem', coinConstructor)
        room.coinSpawnTime = 0
      } else {
        room.coinSpawnTime += intervalTimeStep
      }
    }

    if (room.monsters.length === 0) {
      const monsterConstructor = createMonster()
      room.monsters.push(monsterConstructor)
      const { io } = require('./index.js')
      io.in(room.id).emit('dungeon', 'createMonster', monsterConstructor)
    }

    const winners = detectWinners(room)
    if (winners.length > 0) {
      room.winner = winners[0]
      changeGameStatus(room, 'ending')
      const { io } = require('./index.js')
      io.to(room.id).emit('game', 'showEndgameReport', room.winner)
    }
  }, intervalTimeStep
)

const changeGameStatus = (room, newGameStatus) => {
  const gameStatusIntervals = room.intervals.byGameStatus
  gameStatusIntervals.forEach(interval => clearInterval(interval))
  gameStatusIntervals.splice(0, gameStatusIntervals.length)

  room.methods.initialize()

  if (newGameStatus === 'waiting') {
    gameStatusIntervals.push(registerWaitingIntervals(room))
  } else if (newGameStatus === 'processing') {
    room.disconnectedPlayers = []
    gameStatusIntervals.push(registerProcessingIntervals(room))
  } else if (newGameStatus === 'ending') {
    gameStatusIntervals.push(registerWaitingIntervals(room))
  } else {
    // wrong status, throw
  }

  room.gameStatus = newGameStatus
  const { io } = require('./index.js')
  const roomMethods = require('./rooms').roomMethods
  const gameState = roomMethods.getEmittableFieldOfRoom(room)
  io.to(room.id).emit('game', 'updateGameStatus', gameState)
}

const registerGameLoop = room => {
  room.intervals = {
    alltime: [registerRoomAutoCloseInterval(room)],
    byGameStatus: [registerWaitingIntervals(room)]
  }
}


exports.gameLoop = {
  registerGameLoop
}