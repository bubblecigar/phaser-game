import _ from 'lodash'
import gameMethods from './methods'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'
import items from '../../items/index'
import { castSkill, createInitAbilities, createSkill, Skill } from '../../skills/index'
import { connectToServer } from '../../socket'
import mapConfigs from '../../maps/mapConfigs'
import FOV from './FOV'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../../statics/tile/target.png'

const userId = getLocalUserData().userId

let methods
let socketMethods

let mapConfig = mapConfigs['ghostRoomConfig']
let map

let cursors
let space
let aim
let aimingBar
export let skillInUse: Skill | undefined
export let aimingTime: number = 0


const createAimingBar = (scene, x, y) => {
  aimingBar = scene.add.rectangle(x, y, 20, 4, 0x00FF00)
  aimingBar.setDepth(4)
  aimingBar.setAlpha(0.8)
}

const showAimingBar = (player) => {
  if (!aimingTime || !skillInUse) {
    aimingBar.setVisible(false)
  } else {
    const container = player.phaserObject
    const maximumBar = container.getByName('maximum-bar')
    const aimingBarX = container.x + maximumBar.x
    const aimingBarY = container.y + maximumBar.y

    aimingBar.setX(aimingBarX)
    aimingBar.setY(aimingBarY)
    aimingBar.setOrigin(0, 0.5)

    aimingBar.setVisible(true)
    const percentage = Math.min(aimingTime / skillInUse.castTime, 1)
    aimingBar.setSize(20 * percentage, 4)
    if (percentage < 1) {
      aimingBar.setFillStyle(0x2f61eb)
    } else {
      aimingBar.setFillStyle(0x08960a)
    }
  }
}


function init(data) {
  mapConfig = mapConfigs[data.mapConfigKey] || mapConfig
  methods = gameMethods(this)
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
    bullet: 'fireball',
    abilities: initAbilities,
    phaserObject: null
  }
  return player
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
    aimingTime = 0
    const player = methods.getPlayer(getLocalUserData().userId)
    if (!player) return

    skillInUse = createSkill(player.bullet, player.abilities)

    aim.setAngularVelocity(0.1)
    aim.setVisible(true)
    aim.setX(player.position.x)
    aim.setY(player.position.y)

    aimingBar.setX(player.position.x)
    aimingBar.setY(player.position.y)
  })
  space.on('up', () => {
    // fire
    const player = methods.getPlayer(getLocalUserData().userId)
    if (!player || !aim || !skillInUse) return

    aim.setVisible(false)
    aim.setVelocityX(0)
    aim.setVelocityY(0)

    if (aimingTime >= skillInUse.castTime) {
      castSkill(player, skillInUse, aim, scene, methods, socketMethods)
    }
    aimingTime = 0
    skillInUse = undefined
  })
}

function create() {
  cursors = this.input.keyboard.createCursorKeys()
  registerAimingTarget(this)
  map = FOV.create(this, mapConfig)
  createAimingBar(this, 0, 0)

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
}

const movePlayer = (player: Player, dt) => {
  const char = charactors[player.charactorKey]
  const charVelocity = char.velocity
  const aimVelocity = 3
  const velocity = space.isDown ? aimVelocity : charVelocity
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
    aimingTime += dt
    _player.velocity = { x: 0, y: 0 }
  } else {
    _player.velocity = _velocity
  }

  socketMethods.broadcast(methods, 'movePlayer', _player)
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player || !player.phaserObject) return
  FOV.update(this, player.position)
  movePlayer(player, dt)
  showAimingBar(player)
  socketMethods.writeStateToServer(userId, player)
}

export default {
  key: 'dungeon',
  init,
  preload,
  create,
  update
}