const registerRoomMethods = room => {
  room.methods = {
    initialize: () => {
      room.items = []
      room.monstersById = {}
      room.monsterKilled = 0
      room.idleTime = 0
      room.allPlayerReadyTime = 0
      room.coinSpawnTime = 0
      room.monsterSpawnTime = 0
    },
    writePlayer: (playerState) => {
      const playerIndex = room.players.findIndex(player => player.id === playerState.id)
      if (playerIndex > -1) {
        room.players[playerIndex] = playerState
      } else {
        room.players.push(playerState)
      }
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
    },
    monsterOnHit: (monsterId, damage) => {
      const monster = room.monstersById[monsterId]
      if (!monster) {
        // monster already die
      } else {
        monster.health -= damage
        if (monster.health < 0) {
          monster.health = 0
        }
      }
    },
    onMonsterDead: (monsterId) => {
      const monster = room.monstersById[monsterId]
      if (!monster) {
        // monster already die
      } else {
        room.monsterKilled++
        delete room.monstersById[monsterId]
      }
    }
  }
}

exports.room = {
  registerRoomMethods
}