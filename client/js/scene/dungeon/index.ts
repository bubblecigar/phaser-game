import _ from 'lodash'
import gameMethods from './methods'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'
import items from '../../items/index'
import { castSkill, createInitAbilities, createSkill, Skill } from '../../skills/index'
import { connectToServer } from './socket'
import mapConfigs from '../../maps/mapConfigs'
import FOV from './FOV'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../../statics/tile/target.png'
import bulletUrl from '../../../statics/tile/bullet.png'

const userId = getLocalUserData().userId

let methods
let socketMethods

let mapConfig = mapConfigs['jumpPlatFormConfig']
let map

let cursors, pointer
let aim
export let skillInUse: Skill | undefined
export let aimingTime: number = 0

function init(data) {
  mapConfig = mapConfigs[data.mapConfigKey] || mapConfig
  methods = gameMethods(this)
}

function preload() {
  this.load.image('target', targetUrl)
  this.load.image('bullet', bulletUrl)
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

const createInitPlayerConstructor = () => {
  const item_layer = map.objects.find(o => o.name === 'item_layer')
  const spawnPoint = item_layer ? item_layer.objects.find(o => o.name === 'spawn_point') : { x: map.widthInPixels / 2, y: map.heightInPixels / 2 }
  const x = spawnPoint.x
  const y = spawnPoint.y
  const initCharactor = 'tinyZombie'
  const initHealth = charactors[initCharactor].maxHealth

  const initAbilities = createInitAbilities()

  const player: Player = {
    interface: 'Player',
    id: userId,
    charactorKey: initCharactor,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    health: initHealth,
    coins: 0,
    items: [],
    bullet: 'arrow',
    abilities: initAbilities,
    phaserObject: null
  }
  return player
}

const registerAimingTarget = scene => {
  aim = scene.matter.add.image(-20, -20, 'target', undefined, {
    isSensor: true,
    ignoreGravity: true
  })
  aim.setCollisionGroup(-1)
  aim.setDepth(11)
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()
  pointer = this.input.activePointer
  registerAimingTarget(this)
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

  socketMethods = connectToServer()
  socketMethods.registerSocketEvents(methods)
  registerWorldEvents(this, methods, socketMethods)
  socketMethods.getSocketInstance().emit('player-join', createInitPlayerConstructor())
  socketMethods.readStateFromServer()
  registerInputEvents(this, methods, socketMethods)

  cursors.up.on(
    'down', () => {
      const player = methods.getPlayer(userId)
      if (player.phaserObject.data.values.touched) {
        player.phaserObject.setVelocityY(-5)
        player.phaserObject.setData({ touched: false })
      }
    }
  )
  this.input.on('pointerdown', function () {
    const player = methods.getPlayer(userId)
    socketMethods.broadcast(methods, 'shoot', {
      builderId: player.id,
      from: player.position,
      to: { x: aim.x, y: aim.y }
    })
  })
  this.shootParticles = this.add.particles('bullet')
}

const movePlayer = (player: Player) => {
  const char = charactors[player.charactorKey]
  const charVelocity = char.velocity
  const velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    velocity.x = -charVelocity
  } else if (cursors.right.isDown) {
    velocity.x = charVelocity
  } else {
    velocity.x = 0
  }

  const prevVelocity = player.velocity.x

  player.velocity.x = velocity.x
  player.velocity.y = velocity.y
  player.phaserObject.setVelocityX(velocity.x)

  const changeDirection = !(Math.sign(prevVelocity * player.velocity.x) === 1)
  if (changeDirection) {
    socketMethods.broadcast(methods, 'updatePlayerAnimation', userId, Math.sign(player.velocity.x))
  }
}

const updateAim = scene => {
  const position = pointer.positionToCamera(scene.cameras.main)
  aim.setX(position.x)
  aim.setY(position.y)
}

function update(dt) {
  const player = methods.getPlayer(userId)
  if (!player || !player.phaserObject) return
  FOV.update(this, player.position)
  movePlayer(player)
  updateAim(this)

  socketMethods.broadcast(
    methods,
    'updatePlayerPosition',
    userId,
    { x: player.phaserObject.x, y: player.phaserObject.y }
  )
  socketMethods.writeStateToServer(userId, player)
}

export default {
  key: 'dungeon',
  init,
  preload,
  create,
  update
}