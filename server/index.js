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

const joinRoom = (socket, roomId, userId) => {
  socket.rooms.forEach(
    id => {
      if (id !== socket.id) {
        socket.leave(id)
      }
    }
  )
  socket.join(roomId)
  socket.removeAllListeners(['clients', 'server', 'disconnect'])
  socket.on('clients', (method, ...args) => {
    socket.to(roomId).emit('clients', method, ...args)
  })

  const roomMethods = methods.getRoomMethods(roomId, io)
  socket.on('server', (key, ...args) => {
    roomMethods[key](...args)
  })

  socket.on('disconnect', async function () {
    rooms.disconnectFromRoom(roomId, userId)
    io.in(roomId).emit('clients', 'syncServerStateToClient', rooms.getRoomState(roomId))
  })
}

io.on('connection', async function (socket) {
  const userState = new Proxy({}, {
    set(target, prop, val) {
      if (prop === 'roomId' && val !== target[prop]) {
        joinRoom(socket, val, target.userId)
      }
      target[prop] = val
    }
  })

  socket.on('update-userState', (data) => {
    Object.keys(data).forEach(
      key => {
        userState[key] = data[key]
      }
    )
  })
})
