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
    if (enoughPlayers && allPlayerReady) {
      if (readyForEnoughTime) {
        room.allPlayerReadyTime = 0
        const teamMemberCount = Math.ceil(room.players.length / 2)
        room.players.forEach(
          (player, i) => {
            if (i < teamMemberCount) {
              player.team = 'red'
            } else {
              player.team = 'blue'
            }
          }
        )
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


const getMonsterPossibilityPool = (rarity) => {
  let possibilityPool
  if (rarity <= 1) {
    possibilityPool = [
      { possibility: 1.00, keys: ['tinyZombie', 'imp', 'skeleton'], itemRarity: 1 }
    ]
  } else if (rarity <= 2) {
    possibilityPool = [
      { possibility: 1.00, keys: ['wizzardMale', 'knightFemale', 'elfFemale', 'elfMale'], itemRarity: 2 }
    ]
  } else if (rarity <= 3) {
    possibilityPool = [
      { possibility: 1.00, keys: ['chort', 'lizardFemale'], itemRarity: 2 }
    ]
  } else {
    possibilityPool = [
      { possibility: 1.00, keys: ['orge', 'giantDemon', 'giantZombie'], itemRarity: 3 }
    ]
  }
  return possibilityPool
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

    const monsterBySpawnLocation = Object.keys(room.monstersById).reduce(
      (acc, key) => {
        const monster = room.monstersById[key]
        if (!acc[monster.builderId]) {
          acc[monster.builderId] = []
        }
        acc[monster.builderId].push(monster)
        return acc
      }, {}
    )

    const spawnMonster = (spawnLocation, locationMonsters, monsterPossibilityPool, monsterLimit, spawnInterval) => {
      if (locationMonsters.length >= monsterLimit) {
        room.monsterSpawnTime[spawnLocation] = 0
      } else {
        if (room.monsterSpawnTime[spawnLocation] >= spawnInterval) {
          const monster = createMonster(room, spawnLocation, monsterPossibilityPool)
          room.monstersById[monster.id] = monster
          room.monsterSpawnTime[spawnLocation] = 0
          io.in(room.id).emit('dungeon', 'createMonster', monster)
        } else {
          room.monsterSpawnTime[spawnLocation] += intervalTimeStep
        }
      }
    }
    spawnMonster('west_farm', monsterBySpawnLocation['west_farm'] || [], getMonsterPossibilityPool(1), 2, 3000)
    spawnMonster('east_farm', monsterBySpawnLocation['east_farm'] || [], getMonsterPossibilityPool(1), 2, 3000)
    spawnMonster('west_underground', monsterBySpawnLocation['west_underground'] || [], getMonsterPossibilityPool(1), 3, 3000)
    spawnMonster('east_underground', monsterBySpawnLocation['east_underground'] || [], getMonsterPossibilityPool(1), 3, 3000)
    spawnMonster('west_park', monsterBySpawnLocation['west_park'] || [], getMonsterPossibilityPool(2), 1, 10000)
    spawnMonster('east_park', monsterBySpawnLocation['east_park'] || [], getMonsterPossibilityPool(2), 1, 10000)
    spawnMonster('central_park', monsterBySpawnLocation['central_park'] || [], getMonsterPossibilityPool(3), 1, 10000)
    spawnMonster('sky_park', monsterBySpawnLocation['sky_park'] || [], getMonsterPossibilityPool(4), 1, 20000)

    Object.keys(room.monstersById).forEach(
      id => {
        const monster = room.monstersById[id]
        io.in(room.id).emit('dungeon', 'writeMonster', monster)
      }
    )

    const winners = detectWinners(room)
    if (winners.length > 0) {
      room.winners = winners
      changeGameStatus(room, 'ending')
      io.to(room.id).emit('game', 'showEndgameReport', room.winners)
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