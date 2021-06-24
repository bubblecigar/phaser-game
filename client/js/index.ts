import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import io from 'socket.io-client'
import PhaserRaycaster from 'phaser-raycaster'
import skyUrl from '../statics/sky.png'
import starUrl from '../statics/star.png'
import bombUrl from '../statics/bomb.png'
import fishUrl from '../statics/fish.png'
import tilesetUrl from '../statics/tile/tileset.png'
import tilemapUrl from '../statics/tile/small_map.json'
import { gameState, gameMethods, gameConfig } from '../../share/game'
import { getLocalUserData } from './user'

const userId = getLocalUserData().userId
const methods = gameMethods('client')({ userId, Phaser })

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
  },
  plugins: {
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin'
      }
    ]
  }
};

new Phaser.Game(config)
let cursors, socket, graphics

function preload() {
  gameState.scene = this
  this.load.image('sky', skyUrl);
  this.load.image('star', starUrl);
  this.load.image('bomb', bombUrl);
  this.load.image('fish', fishUrl);
  this.load.image('tileset', tilesetUrl);
  this.load.tilemapTiledJSON('map', tilemapUrl);
}

const registerSocketEvents = () => {
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
}

const setUpBackground = scene => {
  const map = scene.make.tilemap({ key: 'map' })
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  const tileset = map.addTilesetImage('tileset')
  const backgroundLayer = map.createLayer('bg_layer', tileset, 0, 0)
  backgroundLayer.name = 'bg_layer'
  const wallLayer = map.createLayer('wall_layer', tileset, 0, 0)
  wallLayer.name = 'wall_layer'
  map.setCollisionFromCollisionGroup();
}

const registerInputEvents = scene => {
  cursors = scene.input.keyboard.createCursorKeys()
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'z': {
          const player = methods.getPlayer(getLocalUserData().userId)
          const itemConstructor = {
            builderId: player.id,
            id: v4(),
            icon: 'bomb',
            type: 'block',
            position: player.position,
            phaserObject: null
          }
          const item = methods.addItem(itemConstructor)
          socket.emit('addItem', _.omit(item, 'phaserObject'))
          break
        }
        default: {
          // do nothing
        }
      }
    }
  )
}

const registerRaycaster = scene => {
  scene.raycaster = scene.raycasterPlugin.createRaycaster()
  scene.ray = scene.raycaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    },
    collisionRange: 0
  })
  const wallLayer = scene.children.getByName('wall_layer')
  scene.raycaster.mapGameObjects(wallLayer, false, {
    collisionTiles: [1, 2, 3]
  })

  graphics = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0 } })
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
  mask.setInvertAlpha()
  const fow = scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } })
  fow.setDepth(100)
  fow.setMask(mask);
  fow.fillRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight)
}

function create() {
  registerSocketEvents()
  registerInputEvents(this)
  setUpBackground(this)
  registerRaycaster(this)
}

const computeFOV = (scene, position) => {
  scene.ray.setOrigin(position.x, position.y)
  const intersections = scene.ray.castCircle()
  graphics.clear()
  graphics.fillPoints(intersections)
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player) return
  computeFOV(this, player.position)

  const _velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    _velocity.x = -gameConfig.playerVelocity
  } else if (cursors.right.isDown) {
    _velocity.x = gameConfig.playerVelocity
  } else {
    _velocity.x = 0
  }
  if (cursors.up.isDown) {
    _velocity.y = -gameConfig.playerVelocity
  } else if (cursors.down.isDown) {
    _velocity.y = gameConfig.playerVelocity
  } else {
    _velocity.y = 0
  }
  methods.movePlayer(userId, { velocity: _velocity })
  socket.emit('move-player', _.omit(player, 'phaserObject'))
}

export { socket }