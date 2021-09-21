const rooms = require('./state.js').rooms

exports.methods = {
  getRoomMethods: roomId => {
    const room = rooms.getRoomState(roomId)
    return {
      writePlayer: (playerState) => {
        const playerIndex = room.players.findIndex(player => player.id === playerState.id)
        if (playerIndex > -1) {
          room.players[playerIndex] = playerState
        } else {
          room.players.push(playerState)
        }
      }
    }
  }
}