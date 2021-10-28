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


    socket.on('update-room-log', () => {
      io.to(socket.id).emit('loginScene', 'updateRoomLog', roomMethods.getLogs())
    })

    socket.on('leave-room', () => {
      if (room) {
        roomMethods.leaveRoom(room, userState.userId, socket)
        socket.to(room.id).emit('all-scene', 'removePlayer', userState.userId)
      }
    })

    socket.on('change-room', (_userState) => {
      Object.keys(_userState).forEach(
        key => userState[key] = _userState[key]
      )
      const roomId = userState.roomId

      if (room) {
        roomMethods.disconnectFromRoom(room, userState.userId, socket)
        socket.to(room.id).emit('all-scene', 'removePlayer', userState.userId)
      }
      room = roomMethods.connectToRoom(roomId, userState, socket)
      const connectionFail = room === false
      if (connectionFail) {
        const errorMessage = 'Room unavailable, others are playing now'
        io.to(socket.id).emit('game', 'connectionFail', errorMessage)
      } else {
        const gameState = roomMethods.getEmittableFieldOfRoom(room)
        io.to(socket.id).emit('game', 'updateGameStatus', gameState)
        const player = gameState.players.find(player => player.id === userState.userId)
        socket.to(room.id).emit('all-scene', 'createPlayer', player)
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
      if (room) {
        roomMethods.disconnectFromRoom(room, userState.userId, socket)
        socket.to(room.id).emit('all-scene', 'removePlayer', userState.userId)
      }
    })
  } catch (error) {
    console.log('error:', error)
  }
})

exports.io = io