import Phaser from 'phaser'
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
let cursors

function preload() {
  gameState.scene = this
  this.load.image('sky', skyUrl);
  this.load.image('star', starUrl);
  this.load.image('bomb', bombUrl);
  this.load.image('fish', fishUrl);
}

function create() {
  const socket = io.connect({
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

function update() {
  const velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    velocity.x = -gameConfig.playerVelocity
  } else if (cursors.right.isDown) {
    velocity.x = gameConfig.playerVelocity
  } else {
    velocity.x = 0
  }
  if (cursors.up.isDown) {
    velocity.y = -gameConfig.playerVelocity
  } else if (cursors.down.isDown) {
    velocity.y = gameConfig.playerVelocity
  } else {
    velocity.y = 0
  }
  methods.setPlayer(getLocalUserData().userId, { velocity })
}