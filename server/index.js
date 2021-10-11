const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const roomMethods = require('./rooms').roomMethods
const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'))

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port)
})

io.on('connection', async function (socket) {
  try {
    const userState = {
      ...socket.handshake.auth
    }

    let room

    socket.on('change-room', (roomId) => {
      if (room) {
        roomMethods.disconnectFromRoom(room, userState.userId)
      }
      room = roomMethods.connectToRoom(roomId, userState.userId, socket)
      const gameState = roomMethods.getEmittableFieldOfRoom(room)
      io.to(socket.id).emit('game', 'updateGameStatus', gameState)
    })

    socket.on('enter-scene', (sceneKey) => {
      if (room) {
        const gameState = roomMethods.getEmittableFieldOfRoom(room)
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
        try {
          room.methods[key](...args)
        } catch (error) {
          console.log(error)
        }
      }
    })

    socket.on('disconnect', async function () {
      if (room && socket) {
        roomMethods.disconnectFromRoom(room, userState.userId, socket)
        room.methods.syncPlayersInAllClients('all-scene')
      }
    })
  } catch (error) {
    console.log('error:', error)
  }
})

exports.io = io