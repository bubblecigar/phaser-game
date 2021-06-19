import Phaser from 'phaser'
import _ from 'lodash'
import io from 'socket.io-client'
import skyUrl from '../../statics/sky.png'
import starUrl from '../../statics/star.png'
import bombUrl from '../../statics/bomb.png'
import fishUrl from '../../statics/fish.png'
import { gameState, gameMethods, gameConfig } from '../../share/game'
import { getLocalUserData } from './user'
const methods = gameMethods('client')

const config = {
  type: Phaser.AUTO,
  width: gameConfig.canvasWidth,
  height: gameConfig.canvasHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

new Phaser.Game(config)
let cursors, socket

function preload() {
  gameState.scene = this
  this.load.image('sky', skyUrl);
  this.load.image('star', starUrl);
  this.load.image('bomb', bombUrl);
  this.load.image('fish', fishUrl);
}

function create() {
  socket = io.connect({
    auth: {
      ...getLocalUserData()
    }
  })
  Object.keys(methods).forEach(
    method => {
      socket.on(method, (...args) => {
        methods[method](...args)
      })
    }
  )

  this.add.image(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 'sky')
  cursors = this.input.keyboard.createCursorKeys()
}

function update(t, dt) {
  const id = getLocalUserData().userId
  const player = methods.getPlayer(id)
  if (!player) return

  const newVelocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    newVelocity.x = -gameConfig.playerVelocity
  } else if (cursors.right.isDown) {
    newVelocity.x = gameConfig.playerVelocity
  } else {
    newVelocity.x = 0
  }
  if (cursors.up.isDown) {
    newVelocity.y = -gameConfig.playerVelocity
  } else if (cursors.down.isDown) {
    newVelocity.y = gameConfig.playerVelocity
  } else {
    newVelocity.y = 0
  }
  methods.movePlayer(id, { velocity: newVelocity })
  socket.emit('move-player', _.omit(player, 'phaserObject'))
}

export { socket }