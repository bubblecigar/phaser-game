const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const { createMonster } = require('./monster.js').monsterMethods
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
    const { io } = require('./index.js')
    const allPlayerReady = !room.players.some(player => !player.ready)
    const enoughPlayers = room.players.length >= setting.minumumPlayers
    const readyForEnoughTime = room.allPlayerReadyTime >= setting.gameStartCountDown
    const redTeamMemberCount = room.players.reduce((acc, cur) => acc + cur.team === 'red' ? 1 : 0, 0)
    const blueTeamMemberCount = room.players.reduce((acc, cur) => acc + cur.team === 'blue' ? 1 : 0, 0)
    if (enoughPlayers && allPlayerReady && redTeamMemberCount === blueTeamMemberCount) {
      if (readyForEnoughTime) {
        room.allPlayerReadyTime = 0
        changeGameStatus(room, 'processing')
        io.to(room.id).emit('game', 'showStartGameScreen', room.players)
      } else {
        room.allPlayerReadyTime += intervalTimeStep
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
    isDrop: false,
    position: { x: coinSpawnPoint.x, y: coinSpawnPoint.y },
    velocity: { x: 0, y: 0 },
    phaserObject: null
  }
  return coinConstructor
}

const detectWinners = room => {
  const blueTeamMembers = []
  const redTeamMembers = []

  let redTeamCoins = 0
  let blueTeamCoins = 0

  room.players.forEach(
    player => {
      if (player.team === 'red') {
        redTeamCoins += player.coins
        redTeamMembers.push(player)
      }
      if (player.team === 'blue') {
        blueTeamCoins += player.coins
        blueTeamMembers.push(player)
      }
    }
  )

  if (redTeamCoins >= setting.coinsToWin) {
    return redTeamMembers
  }
  if (blueTeamCoins >= setting.coinsToWin) {
    return blueTeamMembers
  }

  return []
}

const registerProcessingIntervals = room => setInterval(
  () => {
    const { io } = require('./index.js')

    const serverSpawnCoins = room.items.filter(
      item => item.itemKey === 'coin' && item.builderId === 'server'
    )
    if (serverSpawnCoins.length > 0) {
      room.coinSpawnTime = 0
    } else {
      if (room.coinSpawnTime >= setting.coinSpawnInterval) {
        const coinConstructor = createCoin()
        room.items.push(coinConstructor)
        io.in(room.id).emit('dungeon', 'addItem', coinConstructor)
        room.coinSpawnTime = 0
      } else {
        room.coinSpawnTime += intervalTimeStep
      }
    }

    if (Object.keys(room.monstersById).length >= setting.maxMonsters) {
      room.monsterSpawnTime = 0
    } else {
      if (room.monsterSpawnTime >= setting.monsterSpawnInterval) {
        const monster = createMonster(room)
        room.monstersById[monster.id] = monster
        room.monsterSpawnTime = 0
        io.in(room.id).emit('dungeon', 'createMonster', monster)
      } else {
        room.monsterSpawnTime += intervalTimeStep
      }
    }
    Object.keys(room.monstersById).forEach(
      id => {
        const monster = room.monstersById[id]
        io.in(room.id).emit('dungeon', 'writeMonster', monster)
      }
    )

    const winners = detectWinners(room)
    if (winners.length > 0) {
      room.winner = winners[0]
      changeGameStatus(room, 'ending')
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