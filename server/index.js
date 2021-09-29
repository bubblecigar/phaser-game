const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const rooms = require('./rooms.js').rooms
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'))

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port)
})

io.on('connection', async function (socket) {
  const userState = {
    ...socket.handshake.auth
  }

  let room

  socket.on('change-room', (roomId) => {
    if (room) {
      rooms.disconnectFromRoom(room.id, userState.userId)
    }
    room = rooms.connectToRoom(roomId, userState.userId, socket)
  })

  socket.on('enter-scene', (sceneKey) => {
    if (room) {
      const gameState = rooms.getEmittableFieldofRoom(room)
      io.to(room.id).emit(sceneKey, 'syncServerStateToClient', gameState)
    }
  })

  socket.on('clients', (sceneKey, method, ...args) => {
    if (room) {
      socket.to(room.id).emit(sceneKey, method, ...args)
    }
  })

  socket.on('server', (key, ...args) => {
    if (room) {
      room.methods[key](...args)
    }
  })

  socket.on('disconnect', async function () {
    if (room) {
      rooms.disconnectFromRoom(room.id, userState.userId)
      room.methods.syncAllClients('all-scene')
    }
  })
})

exports.io = io