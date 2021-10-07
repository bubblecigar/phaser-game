const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const gameLoop = require('./gameLoop').gameLoop

const rooms = {}


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

const createRoom = (roomId) => {
  const room = {
    id: roomId,
    players: [],
    items: [],
    disconnectedPlayers: [],
    idleTime: 0,
    allPlayerReadyTime: 0,
    gameStatus: 'waiting', // -> waiting -> processing -> ending -> waiting
    intervals: null,
    methods: null
  }

  gameLoop.registerGameLoop(room)

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

  return room
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
    gameStatus
  } = room

  return {
    players,
    items,
    gameStatus
  }
}

exports.roomMethods = {
  closeRoom,
  createRoom,
  connectToRoom,
  disconnectFromRoom,
  getEmittableFieldOfRoom
}