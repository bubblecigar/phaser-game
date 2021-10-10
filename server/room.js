const setting = require('../share/setting.json')

const registerRoomMethods = room => {
  room.methods = {
    initialize: () => {
      room.items = []
      room.idleTime = 0
      room.allPlayerReadyTime = 0
      room.players.forEach(
        player => {
          player.coins = 0
          player.ready = false
          player.charactorKey = setting.initCharactor
          player.health = setting.initHealth
          player.resurrectCountDown = setting.resurrectCountDown
        }
      )
    },
    writePlayer: (playerState) => {
      const playerIndex = room.players.findIndex(player => player.id === playerState.id)
      if (playerIndex > -1) {
        room.players[playerIndex] = playerState
      } else {
        room.players.push(playerState)
      }
    },
    syncPlayersInAllClients: (sceneKey) => {
      const { io } = require('./index.js')
      io.in(room.id).emit(sceneKey, 'syncPlayers', room.players)
    },
    addItem: (item) => {
      room.items.push(item)
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
}

exports.room = {
  registerRoomMethods
}