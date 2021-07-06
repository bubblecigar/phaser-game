import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import bombUrl from '../../statics/bomb.png'
import { gameMethods, gameConfig } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactor'
import socket from '../socket'
import tilesetUrl from '../../statics/tile/tileset.png'
import tilemapUrl from '../../statics/tile/small_map.json'

const userId = getLocalUserData().userId

let methods
let cursors
let graphics, renderTexture

function preload() {
  methods = gameMethods('client')({ userId, Phaser, charactors, scene: this })
  this.load.image('bomb', bombUrl);
  this.load.image('tileset', tilesetUrl);
  this.load.tilemapTiledJSON('map', tilemapUrl);
  Object.keys(charactors).forEach(
    char => {
      charactors[char].preload(this)
    }
  )
}

const registerSocketEvents = () => {
  Object.keys(methods).forEach(
    method => {
      socket.on(method, (...args) => {
        methods[method](...args)
      })
    }
  )
}

const setUpMap = scene => {
  const map = scene.make.tilemap({ key: 'map' })
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  return map
}
const setUpTileset = map => {
  const tileset = map.addTilesetImage('tileset')
  return tileset
}
const setUpLayer = (map, tileset) => {
  const backgroundLayer = map.createLayer('bg_layer', tileset, 0, 0)
  backgroundLayer.name = 'bg_layer'
  const wallLayer = map.createLayer('wall_layer', tileset, 0, 0)
  wallLayer.name = 'wall_layer'
  map.setCollisionFromCollisionGroup()
  return [backgroundLayer, wallLayer]
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
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        default: {
          // do nothing
        }
      }
    }
  )
}

const setUpFOVmask = (scene, layer) => {
  scene.raycaster = scene.raycasterPlugin.createRaycaster()
  scene.ray = scene.raycaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    }
  })
  scene.raycaster.mapGameObjects(layer, false, {
    collisionTiles: [17, 18, 19]
  })
  graphics = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.1 } })
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
  mask.setInvertAlpha()
  return mask
}

const setUpBackgroundRenderer = (scene, mask, map, layers) => {
  renderTexture = scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
  renderTexture.setDepth(10)
  renderTexture.setMask(mask);
  renderTexture.clear()
  renderTexture.draw(layers)
}

function create() {
  registerSocketEvents()
  registerInputEvents(this)
  const map = setUpMap(this)
  const tileset = setUpTileset(map)
  const layers = setUpLayer(map, tileset)
  const mask = setUpFOVmask(this, layers[1])
  setUpBackgroundRenderer(this, mask, map, layers)

  Object.keys(charactors).forEach(
    char => {
      charactors[char].create(this)
    }
  )

  socket.emit('init-player')
}

const computeFOV = (scene, position) => {
  scene.ray.setOrigin(position.x, position.y)
  const intersections = scene.ray.castCircle()
  graphics.clear()
  graphics.fillPoints(intersections)
}

const movePlayer = player => {
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
  const changeDirection = !_.isEqual(_velocity, player.velocity)
  methods.movePlayer(userId, { velocity: _velocity })
  const isBlocked = !player.phaserObject.body.blocked.none
  if (changeDirection || isBlocked) {
    socket.emit('move-player', _.omit(player, 'phaserObject'))
  }
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player) return
  computeFOV(this, player.position)
  movePlayer(player)
}

export default {
  preload,
  create,
  update
}