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
      } else {
        room.allPlayerReadyTime += intervalTimeStep
        io.in(room.id).emit('game', 'gameStartCountDown', setting.gameStartCountDown - room.allPlayerReadyTime)
      }
    } else {
      room.allPlayerReadyTime = 0
    }
  }, intervalTimeStep
)

const createCoin = (room) => {
  const mapFile = serverMap[room.mapInUse].file
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

const registerMonsterSpawnInterval = (room, spawnPoint, spawnPointProperty) => setInterval(
  () => {
    const { io } = require('./index.js')
    const aliveMonsters = Object.keys(room.monstersById).reduce(
      (acc, key) => room.monstersById[key].builderId === spawnPoint.id ? acc + 1 : acc, 0
    )
    if (aliveMonsters >= spawnPointProperty.max) {
      room.monsterSpawnTime[spawnPoint.id] = 0
    } else {
      if (room.monsterSpawnTime[spawnPoint.id] >= spawnPointProperty.spawn_interval) {
        const monster = createMonster(room, spawnPoint, spawnPointProperty)
        room.monstersById[monster.id] = monster
        room.monsterSpawnTime[spawnPoint.id] = 0
        io.in(room.id).emit('dungeon', 'createMonster', monster)
      } else {
        room.monsterSpawnTime[spawnPoint.id] += intervalTimeStep
      }
    }
  }, intervalTimeStep
)

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
        const coinConstructor = createCoin(room)
        room.items.push(coinConstructor)
        io.in(room.id).emit('dungeon', 'addItem', coinConstructor)
        room.coinSpawnTime = 0
      } else {
        room.coinSpawnTime += intervalTimeStep
      }
    }

    io.in(room.id).emit('dungeon', 'writeMonsters', room.monstersById)

    const winners = detectWinners(room)
    if (winners.length > 0) {
      room.winners = winners
      changeGameStatus(room, 'ending')
      io.in(room.id).emit('game', 'resetPlayer', {
        ready: false,
        team: 'red',
        action: 'tab',
        attributes: {
          maxHealth: 20,
          movementSpeed: 1,
          vision: 75,
          healthRegen: 1,
          attackSpeed: 1,
          damage: 1,
          jump: 1
        },
        item: 'dagger',
        health: 20,
        resurrectCountDown: setting.resurrectCountDown,
        coins: 0,
        exp: 0,
        level: 1,
      })
    }
  }, intervalTimeStep
)

const changeGameStatus = (room, newGameStatus) => {
  const gameStatusIntervals = room.intervals.byGameStatus
  gameStatusIntervals.forEach(interval => clearInterval(interval))
  gameStatusIntervals.splice(0, gameStatusIntervals.length)

  room.methods.initialize()

  let sceneToRun
  if (newGameStatus === 'waiting') {
    gameStatusIntervals.push(registerWaitingIntervals(room))
    sceneToRun = 'waitingRoom'
  } else if (newGameStatus === 'processing') {
    room.disconnectedPlayers = []
    gameStatusIntervals.push(registerProcessingIntervals(room))
    const mapFile = serverMap[room.mapInUse].file
    const mapUrl = `../share/map/${mapFile}`
    const map = require(mapUrl)
    const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
    const monsterSpawnPoints = infoLayer.objects.filter(object => object.name === 'monster_point')
    monsterSpawnPoints.forEach(
      spawnPoint => {
        room.monsterSpawnTime[spawnPoint.id] = 0
        const spawnPointProperty = spawnPoint.properties.reduce(
          (acc, cur) => {
            acc[cur.name] = cur.value
            return acc
          }, {}
        )
        gameStatusIntervals.push(registerMonsterSpawnInterval(room, spawnPoint, spawnPointProperty))
      }
    )
    sceneToRun = 'beforeStart'
  } else if (newGameStatus === 'ending') {
    gameStatusIntervals.push(registerWaitingIntervals(room))
    sceneToRun = 'afterEnd'
  } else {
    // wrong status, throw
  }

  room.gameStatus = newGameStatus
  const { io } = require('./index.js')
  const roomMethods = require('./rooms').roomMethods
  const gameState = roomMethods.getEmittableFieldOfRoom(room)
  io.to(room.id).emit('game', 'changeScene', { serverGameState: gameState, sceneToRun, mapKey: gameState.gameStatus === 'processing' ? gameState.mapInUse : 'readyRoom' })
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