import _ from 'lodash'
import gameMethods from './methods'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'
import items from '../../items/index'
import clientMap from '../../../../share/clientMap'
import backgroundMap from './backgroundMap'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../../statics/tile/target.png'
import { socketMethods } from '../../index'
import gameState from '../../game/state'

const userId = getLocalUserData().userId

let methods
let cursors, pointer
let aim, aimDirection
let readyToShoot = true

const registerAimingTarget = scene => {
  aim = scene.matter.add.image(-20, -20, 'target', undefined, {
    isSensor: true,
    ignoreGravity: true
  })
  aim.setCollisionGroup(-1)
  aim.setDepth(11)
}

const updateAim = (scene, player) => {
  const position = pointer.positionToCamera(scene.cameras.main)
  aim.setX(position.x)
  aim.setY(position.y)

  const newDirection = position.x < player.position.x ? 'left' : 'right'
  const changeDirection = aimDirection !== newDirection
  if (changeDirection) {
    socketMethods.clientsInScene(scene.scene.key, methods, 'updatePlayerDirection', userId, newDirection)

  }
}

const movePlayer = (scene, player: Player) => {
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

  const newAnimation = player.velocity.x === 0 ? 'idle' : 'move'
  const oldAnimation = prevVelocity === 0 ? 'idle' : 'move'
  const changeAnimation = newAnimation !== oldAnimation
  if (changeAnimation) {
    socketMethods.clientsInScene(scene.scene.key, methods, 'updatePlayerAnimation', userId, newAnimation)
  }
}

function init(serverGameState) {
  gameState.players = serverGameState.players
  gameState.items = serverGameState.items
  gameState.gameStatus = serverGameState.gameStatus
  methods = gameMethods(this)
}

function preload() {
  this.load.image('target', targetUrl)
  const mapConfig = clientMap[this.scene.key]
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

function create() {
  this.arrows = {}
  cursors = this.input.keyboard.createCursorKeys()
  pointer = this.input.activePointer
  registerAimingTarget(this)
  backgroundMap.registerMap(this, clientMap[this.scene.key])

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

  socketMethods.registerSceneSocketEvents(this.scene.key, methods)
  console.log(gameState)
  methods.createPlayers()
  registerWorldEvents(this, methods, socketMethods)
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
  const scene = this
  this.input.on('pointerdown', function () {
    const player = methods.getPlayer(userId)
    if (readyToShoot && player) {
      socketMethods.clientsInScene(scene.scene.key, methods, 'shoot', {
        builderId: player.id,
        from: player.position,
        to: { x: aim.x, y: aim.y }
      })
      readyToShoot = false
      scene.time.delayedCall(
        333,
        () => {
          readyToShoot = true
        },
        null,
        scene
      )
    }
  })
}

function update(t, dt) {
  try {
    const player = methods.getPlayer(userId)
    if (!player || !player.phaserObject) return
    backgroundMap.updateFOV(this, player.position)
    movePlayer(this, player)
    updateAim(this, player)

    Object.keys(this.arrows).forEach(
      id => this.arrows[id].align()
    )

    player.position = { x: player.phaserObject.x, y: player.phaserObject.y }
    player.scene = this.scene.key
    const emittablePlayer = _.omit(player, 'phaserObject')
    socketMethods.clientsInScene('all-scene', methods, 'writePlayer', emittablePlayer
    )
    socketMethods.server('writePlayer', emittablePlayer)

    if (player.health <= 0) {
      player.resurrectCountDown -= dt
      if (player.resurrectCountDown <= 0) {
        socketMethods.clientsInScene(
          this.scene.key,
          methods,
          'resurrect',
          player.id
        )
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  init,
  preload,
  create,
  update
}