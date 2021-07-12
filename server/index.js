const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { gameMethods, gameState } = require('../share/game.js')

const methods = gameMethods('server')({})

const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  const userData = socket.handshake.auth

  for (let method of Object.keys(methods)) {
    socket.on(method, (...args) => {
      methods[method](...args)
      socket.broadcast.emit(method, ...args)
    })
  }

  socket.on('init-player', (player) => {
    methods.addPlayer(player)
    io.emit('emitGameStateFromServer', gameState)
  })

  socket.on('move-player', player => {
    const data = { position: player.position, velocity: player.velocity }
    methods.movePlayer(player.id, data)
    socket.broadcast.emit('movePlayer', player.id, data)
  })

  socket.on('disconnect', async function () {
    io.emit('removePlayer', userData.userId)
    methods.removePlayer(userData.userId)
  });

});
