const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const rooms = require('./state.js').rooms
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  const userData = socket.handshake.auth
  const roomId = userData.roomId
  socket.join(roomId)
  const gameState = rooms.connectToRoom(roomId, io, userData.userId)

  socket.on('install-item-layer', item_layer => {
    // install TileMap data from client
    if (gameState.itemLayer === null) {
      gameState.itemLayer = item_layer
    }
  })

  // init player or get player in room
  socket.on('player-join', () => {
    const player = gameState.players.find(player => player.id === userData.userId)
    if (player) {
      // player already existed, do nothing
    } else {
      // create player on spawn_point
      const spawnPoints = gameState.itemLayer.objects.filter(o => o.name === 'spawn_point')
      const spawnPoint = spawnPoints ? spawnPoints[0] : { x: 100, y: 100 }
      const playerConstructor = {
        interface: 'Player',
        id: userData.userId,
        charactorKey: 'tinyZombie',
        position: { x: spawnPoint.x, y: spawnPoint.y },
        velocity: { x: 0, y: 0 },
        health: 20,
        coins: 0,
        items: [],
        bullet: 'arrow',
        abilities: null,
        phaserObject: null
      }
      gameState.players.push(playerConstructor)
    }
    io.in(roomId).emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })

  socket.on('READ_SERVER_GAME_STATE', () => {
    io.in(roomId).emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })

  socket.on('WRITE_PLAYER_STATE_TO_SERVER', (userId, playerState) => {
    const playerIndex = gameState.players.findIndex(player => player.id === userId)
    gameState.players
    if (playerIndex > -1) {
      gameState.players[playerIndex] = playerState
    } else {
      gameState.players.push(playerState)
    }
  })

  socket.on('serverGameStateUpdate', (action, data) => {

    const checkWinner = () => {
      const winner = gameState.players.find(
        player => player.coins >= 10
      )
      return winner
    }

    switch (action) {
      case 'collectItem': {
        const itemIndex = gameState.items.findIndex(item => item.id === data.itemId)
        if (itemIndex < 0) {
          // already been collected by other player
        } else {
          // collect effect 
          gameState.items.splice(itemIndex, 1)
        }
        const winner = checkWinner()
        console.log('winner:', winner)
      }
      default: {
        // unhandled action
      }
    }
  })

  socket.on('broadcast', (method, ...args) => {
    socket.to(roomId).emit('broadcast', method, ...args)
  })

  socket.on('disconnect', async function () {
    rooms.disconnectFromRoom(roomId, userData.userId)
    // io.in(roomId).emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })
})
