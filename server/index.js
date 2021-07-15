const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { gameMethods } = require('../share/game.js')
const gameState = require('./state.js').state

const methods = gameMethods('server')({})

const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  const userData = socket.handshake.auth

  // init player or get player in room
  socket.on('player-join', initPlayerConstructor => {
    const player = gameState.players.find(player => player.id === userData.userId)
    if (player) {
      // do nothing
    } else {
      gameState.players.push(initPlayerConstructor)
    }
    io.emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })

  socket.on('READ_SERVER_GAME_STATE', () => {
    io.emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })

  socket.on('WRITE_SERVER_GAME_STATE', (userId, playerState) => {
    const playerIndex = gameState.players.findIndex(player => player.id === userId)
    gameState.players
    if (playerIndex > -1) {
      gameState.players[playerIndex] = playerState
    } else {
      gameState.players.push(playerState)
    }
  })

  socket.on('broadcast', (method, ...args) => {
    socket.broadcast.emit('broadcast', method, ...args)
  })

  socket.on('disconnect', async function () {
    const playerIndex = gameState.players.findIndex(player => player.id === userData.id)
    if (playerIndex > -1) {
      gameState.players.splice(playerIndex, 1)
    } else {
      // do nothing
    }
    io.emit('UPDATE_CLIENT_GAME_STATE', gameState)
  })
})
