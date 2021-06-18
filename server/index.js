const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const cwd = process.cwd()
app.use('/', express.static(cwd + '/dist'));

server.listen(process.env.PORT || 8081, function () {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async function (socket) {
  let userData = socket.handshake.auth
  console.log('userData:', userData)


  socket.on('disconnect', async function () {

  });

});
