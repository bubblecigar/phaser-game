import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { gameMethods, Player, Point, Bullet } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactors/index'
import items from '../items/index'
import socket, { registerSocketEvents } from '../socket'
import mapConfigs from './mapConfigs'
import FOV from './FOV'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../statics/tile/target.png'

const userId = getLocalUserData().userId

let methods
let cursors
let space
let aim
let mapConfig = mapConfigs['ghostRoomConfig']
let map

function init(data) {
  mapConfig = mapConfigs[data.mapConfigKey] || mapConfig
  methods = gameMethods('client')({ userId, Phaser, charactors, items, scene: this })
  registerSocketEvents(methods)
  registerWorldEvents(this, methods)
}

function preload() {
  this.load.image('target', targetUrl)
  this.load.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  this.load.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)
  Object.keys(charactors).forEach(
    key => {
      const char = charactors[key]
      this.load.spritesheet(char.spritesheetConfig.spritesheetKey, char.spritesheetConfig.spritesheetUrl, char.spritesheetConfig.options)
    }
  )
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      this.load.spritesheet(item.spritesheetConfig.spritesheetKey, item.spritesheetConfig.spritesheetUrl, item.spritesheetConfig.options)
    }
  )
}

const createPlayer = () => {
  const item_layer = map.objects.find(o => o.name === 'item_layer')
  const spawnPoint = item_layer ? item_layer.objects.find(o => o.name === 'spawn_point') : { x: map.widthInPixels / 2, y: map.heightInPixels / 2 }
  const x = spawnPoint.x
  const y = spawnPoint.y
  const initCharactor = 'tinyZombie'
  const initHealth = charactors[initCharactor].maxHealth
  const player: Player = {
    interface: 'Player',
    id: userId,
    charactorKey: initCharactor,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    health: initHealth,
    coins: 0,
    items: [],
    phaserObject: null
  }
  socket.emit('init-player', player)
}

const registerAimingTarget = scene => {
  aim = scene.matter.add.image(0, 0, 'target', undefined, { isSensor: true })
  aim.setCollisionGroup(-1)
  aim.setVisible(false)
  aim.setDepth(11)
  aim.setFixedRotation()
  aim.setAngularVelocity(0.1)

  space = scene.input.keyboard.addKey('space')
  space.on('down', () => {
    // aim
    const player = methods.getPlayer(getLocalUserData().userId)
    if (!player) return
    aim.setAngularVelocity(0.1)
    aim.setVisible(true)
    aim.setX(player.position.x)
    aim.setY(player.position.y)
  })
  space.on('up', () => {
    // fire
    aim.setVisible(false)
    aim.setVelocityX(0)
    aim.setVelocityY(0)

    const player: Player = methods.getPlayer(getLocalUserData().userId)
    const charactor = charactors[player.charactorKey]
    const bulletKey = charactor.bullet
    const bullet = items[bulletKey]
    if (!bullet) { return }

    const dx = aim.x - player.position.x
    const dy = aim.y - player.position.y
    const l = Math.sqrt(dx * dx + dy * dy)
    let force = l / 10
    if (force < 1) { return }
    if (force > 3) { force = 3 }
    const vx = dx * force / l
    const vy = dy * force / l

    const itemConstructor: Bullet = {
      interface: 'Bullet',
      id: v4(),
      itemKey: bullet.key,
      damage: bullet.damage,
      position: player.position,
      velocity: { x: vx, y: vy },
      phaserObject: null
    }
    methods.shootInClient(itemConstructor)
    socket.emit('shootInClient', itemConstructor)
  })
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()
  registerAimingTarget(this)
  registerInputEvents(this, methods)
  map = FOV.create(this, mapConfig)

  Object.keys(charactors).forEach(
    key => {
      const char = charactors[key]
      Object.keys(char.animsConfig).forEach(
        _key => {
          const animConfig = char.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(char.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
            frameRate: 8,
            repeat: -1
          })
        }
      )
    }
  )
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      Object.keys(item.animsConfig).forEach(
        _key => {
          const animConfig = item.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(item.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
            frameRate: 8,
            repeat: -1
          })
        }
      )
    }
  )

  createPlayer()
  this.scene.launch('GUI')
}

const movePlayer = (player: Player) => {
  const char = charactors[player.charactorKey]
  const velocity = char.velocity
  const _velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    _velocity.x = -velocity
  } else if (cursors.right.isDown) {
    _velocity.x = velocity
  } else {
    _velocity.x = 0
  }
  if (cursors.up.isDown) {
    _velocity.y = -velocity
  } else if (cursors.down.isDown) {
    _velocity.y = velocity
  } else {
    _velocity.y = 0
  }

  const _player = _.omit(_.clone(player), 'phaserObject')
  if (space.isDown) {
    aim.setVelocityX(_velocity.x)
    aim.setVelocityY(_velocity.y)
    _player.velocity = { x: 0, y: 0 }
  } else {
    _player.velocity = _velocity
  }

  methods.movePlayer(_player)
  socket.emit('movePlayer', _player)
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player || !player.phaserObject) return
  FOV.update(this, player.position)
  movePlayer(player)
}

export default {
  key: 'dungeon',
  init,
  preload,
  create,
  update
}