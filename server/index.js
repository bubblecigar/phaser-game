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

  socket.on('init-player', (player) => {
    methods.addPlayer(player)
    io.emit('addPlayer', player)
    io.emit('syncPlayers', gameState.players)
    io.emit('syncItems', gameState.items)
  })

  socket.on('move-player', player => {
    const data = { position: player.position, velocity: player.velocity }
    methods.movePlayer(player.id, data)
    socket.broadcast.emit('movePlayer', player.id, data)
  })

  socket.on('addItem', item => {
    methods.addItem(item)
    socket.broadcast.emit('addItem', item)
  })
  socket.on('removeItem', id => {
    methods.removeItem(id)
    socket.broadcast.emit('removeItem', id)
  })


  socket.on('disconnect', async function () {
    io.emit('removePlayer', userData.userId)
    methods.removePlayer(userData.userId)
  });

});
