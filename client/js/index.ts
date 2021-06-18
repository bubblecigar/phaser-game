import Phaser from 'phaser'
import io from 'socket.io-client'
import skyUrl from '../../statics/sky.png'
import starUrl from '../../statics/star.png'
import bombUrl from '../../statics/bomb.png'
import fishUrl from '../../statics/fish.png'
import { gameState, gameMethods } from '../../share/game'
import { getLocalUserData } from './user'

const socket = io.connect({
  auth: {
    ...getLocalUserData()
  }
})

const canvasWidth = 800
const canvasHeight = 600
const playerVelocity = 300

const config = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
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
  this.add.image(canvasWidth / 2, canvasHeight / 2, 'sky')
  cursors = this.input.keyboard.createCursorKeys()
  this.input.keyboard.on(
    'keydown', e => {
      if (e.key === 'o') {
        const x = canvasWidth * Math.random()
        const y = canvasHeight * Math.random()
        gameMethods.addPlayer({ x, y }, 'star', getLocalUserData().userId)
      }
    }
  )
}

function update() {
  const velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    velocity.x = -playerVelocity
  } else if (cursors.right.isDown) {
    velocity.x = playerVelocity
  } else {
    velocity.x = 0
  }
  if (cursors.up.isDown) {
    velocity.y = -playerVelocity
  } else if (cursors.down.isDown) {
    velocity.y = playerVelocity
  } else {
    velocity.y = 0
  }
  gameMethods.setPlayer(getLocalUserData().userId, { velocity })
}


export { socket }