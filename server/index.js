const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const rooms = require('./state.js').rooms
const { methods } = require('./methods.js')
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'))

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port)
})

io.on('connection', async function (socket) {
  const userState = {
    ...socket.handshake.auth
  }

  let roomMethods

  socket.on('change-room', (roomId) => {
    rooms.disconnectFromRoom(userState.roomId, userState.userId)
    rooms.connectToRoom(roomId, userState.userId, io, socket)
    roomMethods = methods.getRoomMethods(roomId, io)
    userState.roomId = roomId
  })

  socket.on('enter-scene', (sceneKey) => {
    const gameState = rooms.getRoomState(userState.roomId)
    io.to(userState.roomId).emit(sceneKey, 'syncServerStateToClient', gameState)
  })

  socket.on('clients', (sceneKey, method, ...args) => {
    socket.to(userState.roomId).emit(sceneKey, method, ...args)
  })

  socket.on('server', (key, ...args) => {
    if (!roomMethods) {
      return
    }
    roomMethods[key](...args)
  })

  socket.on('disconnect', async function () {
    rooms.disconnectFromRoom(userState.roomId, userState.userId)
    if (roomMethods) {
      roomMethods.syncAllClients('all-scene')
    }
  })
})
