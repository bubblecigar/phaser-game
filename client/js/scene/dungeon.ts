import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import bombUrl from '../../statics/bomb.png'
import { gameMethods, gameConfig, gameState, Player, PlayerItem, Item } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactor'
import socket, { registerSocketEvents } from '../socket'
import tilesetUrl from '../../statics/tile/tileset.png'
import dungeonMapUrl from '../../statics/tile/small_map.json'
import roomMapUrl from '../../statics/tile/room_map.json'

const userId = getLocalUserData().userId

let methods
let cursors
let graphics
let mapConfig

interface MapConfig {
  mapKey: string,
  mapUrl: string,
  tilesetKey: string,
  tilesetUrl: string,
  collisionTiles: number[]
}

interface StaticItem extends Item {

}


const dungeonMapConfig: MapConfig = {
  mapKey: 'dungeon',
  mapUrl: dungeonMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl,
  collisionTiles: [17, 18, 19]
}
const roomMapConfig: MapConfig = {
  mapKey: 'room',
  mapUrl: roomMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl,
  collisionTiles: [17, 18, 19]
}

function init(data) {
  mapConfig = data.mapConfig || roomMapConfig
  methods = gameMethods('client')({ userId, Phaser, charactors, scene: this })
  registerSocketEvents(methods)
}

function preload() {
  this.load.image('bomb', bombUrl);
  this.load.image(dungeonMapConfig.tilesetKey, dungeonMapConfig.tilesetUrl);
  this.load.tilemapTiledJSON(dungeonMapConfig.mapKey, dungeonMapConfig.mapUrl);
  this.load.image(roomMapConfig.tilesetKey, roomMapConfig.tilesetUrl);
  this.load.tilemapTiledJSON(roomMapConfig.mapKey, roomMapConfig.mapUrl);
  Object.keys(charactors).forEach(
    char => {
      charactors[char].preloadAssets(this)
    }
  )
}

const registerInputEvents = scene => {
  cursors = scene.input.keyboard.createCursorKeys()
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 'a': {
          methods.init()
          const mapConfig: MapConfig = dungeonMapConfig
          scene.scene.restart({ mapConfig })
          break
        }
        case 's': {
          methods.init()
          const mapConfig: MapConfig = roomMapConfig
          scene.scene.restart({ mapConfig })
          break
        }
        case 'z': {

          const getNearestReachableItem = (position, items = gameState.items) => {
            let reachable = false
            const nearestItem = _.minBy(items, item => {
              const distance = Phaser.Math.Distance.BetweenPoints(item.position, position)
              if (distance < 30) { reachable = true }
              return distance
            })
            return reachable && nearestItem
          }

          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const interactableItem = getNearestReachableItem(player.position)
          if (!interactableItem) return
          methods.interact(player, interactableItem)
          break
        }
        case 'x': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const itemConstructor: PlayerItem = {
            builderId: player.id,
            key: 'player-bomb',
            id: v4(),
            icon: 'bomb',
            type: 'block',
            position: player.position,
            phaserObject: null
          }
          const item: PlayerItem = methods.addItem(itemConstructor)
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

const setUpMap = (scene, key) => {
  const map = scene.make.tilemap({ key })
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  return map
}
const setUpTileset = (map, key) => {
  const tileset = map.addTilesetImage(key)
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

const setUpFOVmask = (scene, layer, collisionTiles) => {
  scene.raycaster = scene.raycasterPlugin.createRaycaster()
  scene.ray = scene.raycaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    }
  })
  scene.raycaster.mapGameObjects(layer, false, { collisionTiles })
  graphics = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.1 } })
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
  mask.setInvertAlpha()
  return mask
}

const setUpBackgroundRenderer = (scene, mask, map, layers) => {
  const renderTexture = scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
  renderTexture.setDepth(10)
  renderTexture.setMask(mask);
  renderTexture.clear()
  renderTexture.fill('#000000', 1)
  renderTexture.draw(layers)
  return renderTexture
}

const setUpBackground = (scene, config: MapConfig) => {
  const { mapKey, tilesetKey, collisionTiles } = config
  const map = setUpMap(scene, mapKey)
  const tileset = setUpTileset(map, tilesetKey)
  const layers = setUpLayer(map, tileset)
  const mask = setUpFOVmask(scene, layers[1], collisionTiles)
  setUpBackgroundRenderer(scene, mask, map, layers)
}

function create() {
  registerInputEvents(this)
  setUpBackground(this, mapConfig)

  Object.keys(charactors).forEach(
    char => {
      charactors[char].createAnims(this)
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

const movePlayer = (player: Player) => {
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
  key: 'dungeon',
  init,
  preload,
  create,
  update
}