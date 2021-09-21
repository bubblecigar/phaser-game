const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const rooms = require('./state.js').rooms
const { methods } = require('./methods.js')
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  const userData = socket.handshake.auth
  const roomId = userData.roomId
  socket.join(roomId)
  const gameState = rooms.createRoom(roomId, io, userData.item_layer)
  rooms.connectToRoom(roomId, userData.userId)
  io.in(roomId).emit('clients', 'syncServerStateToClient', gameState)

  socket.on('clients', (method, ...args) => {
    socket.to(roomId).emit('clients', method, ...args)
  })

  const roomMethods = methods.getRoomMethods(roomId, io)
  socket.on('server', (key, ...args) => {
    roomMethods[key](...args)
  })

  socket.on('disconnect', async function () {
    rooms.disconnectFromRoom(roomId, userData.userId)
    io.in(roomId).emit('clients', 'syncServerStateToClient', gameState)
  })
})
