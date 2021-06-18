const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { gameMethods, gameConfig, gameState } = require('../share/game.js')
const methods = gameMethods('server')

const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  let userData = socket.handshake.auth
  const x = gameConfig.canvasWidth * Math.random()
  const y = gameConfig.canvasHeight * Math.random()
  methods.addPlayer({ x, y }, 'star', userData.userId)
  io.emit('addPlayer', { x, y }, 'star', userData.userId)

  socket.on('disconnect', async function () {
    io.emit('removePlayer', userData.userId)
    methods.removePlayer(userData.userId)
  });

});
