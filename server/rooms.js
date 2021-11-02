const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const registerGameLoop = require('./gameLoop').gameLoop.registerGameLoop
const registerRoomMethods = require('./room').room.registerRoomMethods

const rooms = {}
const logs = []
const pushLogs = message => {
  const date = new Date()
  const hours = ("0" + date.getHours()).slice(-2)
  const minutes = ("0" + date.getMinutes()).slice(-2)
  const _message = `[${hours}:${minutes}]: ${message}`
  logs.push(_message)
  if (logs.length > 3) {
    logs.shift()
  }
}

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
  pushLogs(`Room ${roomId} has been idled for too long, auto closed`)
}

const createRoom = (roomId) => {
  const room = {
    id: roomId,
    players: [],
    items: [],
    monstersById: {},
    monsterSpawnTime: 0,
    monsterKilled: 0,
    disconnectedPlayers: [],
    idleTime: 0,
    coinSpawnTime: 0,
    allPlayerReadyTime: 0,
    gameStatus: 'waiting', // -> waiting -> processing -> ending -> waiting
    winner: null,
    intervals: null,
    methods: null
  }

  registerGameLoop(room)
  registerRoomMethods(room)

  pushLogs(`Room ${roomId} has been opened, new players are welcomed`)
  return room
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

const isRoomOpenForUser = (roomId, userId) => {
  const room = rooms[roomId]

  if (!room) {
    // room is empty, anyone can join
    return true
  } else if (room.gameStatus === 'processing') {
    // game in this room is processing, only reconnection is allowed
    const userWasInRoom = room.disconnectedPlayers.some(player => player.id === userId)
    return userWasInRoom
  } else {
    // gameStatus is waiting or ending, new players are welcomed
    return true
  }
}

const connectToRoom = (roomId, userState, socket) => {
  const { userId, username, activatedSkin } = userState
  const ableToConnect = isRoomOpenForUser(roomId, userId)
  if (!ableToConnect) {
    return false
  }

  socket.join(roomId)

  if (!rooms[roomId]) {
    rooms[roomId] = createRoom(roomId)
  }
  const room = rooms[roomId]

  const reconnectSuccess = reconnectPlayer(room, userId)
  if (!reconnectSuccess) {
    const mapFile = serverMap.waiting.map
    const mapUrl = `../share/map/${mapFile}`
    const map = require(mapUrl)
    const infoLayer = map.layers.find(o => o.name === 'info_layer')
    const spawnPoint = infoLayer.objects.find(o => o.name === 'red_team_spawn_point' || o.name === 'blue_team_spawn_point')
    const initHealth = setting.initHealth
    const playerConstructor = {
      interface: 'Player',
      id: userId,
      name: username,
      ready: false,
      team: 'red',
      scene: 'waitingRoom',
      skin: activatedSkin,
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
      position: { x: spawnPoint.x, y: spawnPoint.y },
      velocity: { x: 0, y: 0 },
      health: initHealth,
      resurrectCountDown: setting.resurrectCountDown,
      coins: 0,
      exp: 0,
      level: 1,
      items: [],
      abilities: null,
      phaserObject: null
    }
    room.players.push(playerConstructor)
  }

  pushLogs(`${username} join room ${roomId}`)
  return room
}

const leaveRoom = (room, userId, socket) => {
  disconnectFromRoom(room, userId, socket)
  const userIndex = room.disconnectedPlayers.findIndex(player => player.id === userId)
  const player = room.disconnectedPlayers[userIndex]
  const username = player ? player.name : 'someone'
  pushLogs(`${username} leave room ${room.id}`)

  room.disconnectedPlayers.splice(userIndex, 1)
}

const disconnectFromRoom = (room, userId, socket) => {
  socket.rooms.forEach(
    id => {
      if (id !== socket.id) {
        socket.leave(id)
      }
    }
  )

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
    gameStatus,
    winner,
    monstersById
  } = room

  return {
    players,
    items,
    gameStatus,
    winner,
    monstersById
  }
}

const getRoomList = () => {
  return Object.keys(rooms).map(
    key => ({
      roomId: rooms[key].id,
      players: rooms[key].players.length,
      gameStatus: rooms[key].gameStatus
    })
  )
}

const getLogs = () => {
  return logs
}

exports.roomMethods = {
  closeRoom,
  createRoom,
  connectToRoom,
  disconnectFromRoom,
  leaveRoom,
  getEmittableFieldOfRoom,
  getRoomList,
  getLogs
}