import _ from 'lodash'
import gameMethods from './methods'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import charactors from '../../charactors/index'
import clientMap from '../../../../share/clientMap'
import backgroundMap from './backgroundMap'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../../statics/tile/target.png'
import { socketMethods } from '../../index'
import gameState from '../../game/state'
import { bulletsRefKey } from './shoot/index'
import collisionCategories from './collisionCategories'
import { sounds } from '../../sounds/index'

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
  aim.setCollisionGroup(collisionCategories.CATEGORY_TRANSPARENT)
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
  Object.keys(serverGameState).forEach(
    key => {
      gameState[key] = serverGameState[key]
    }
  )
  methods = gameMethods(this)
  readyToShoot = true
}

function preload() {
  this.load.image('target', targetUrl)
  const mapConfig = clientMap[this.scene.key]
  this.load.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  this.load.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)


  Object.keys(sounds).forEach(
    key => {
      this.load.audio(key, sounds[key].url)
    }
  )
}

function create() {
  this.game.scene.getScene('GUI').cameras.main.fadeIn(1500, 0, 0, 0)

  cursors = this.input.keyboard.createCursorKeys()
  pointer = this.input.activePointer
  registerAimingTarget(this)
  backgroundMap.registerMap(this, clientMap[this.scene.key])

  socketMethods.registerSceneSocketEvents(this.scene.key, methods)
  registerWorldEvents(this, methods, socketMethods)
  registerInputEvents(this, methods, socketMethods)

  methods.createPlayers()
  methods.createItems()

  const scene = this
  cursors.up.on(
    'down', () => {
      const player = methods.getPlayer(userId)
      if (player.phaserObject.data.values.touched) {
        scene.sound.play('quickJump')
        player.phaserObject.setVelocityY(-5)
        player.phaserObject.setData({ touched: false })
      }
    }
  )
  this.input.on('pointerdown', function () {
    const player = methods.getPlayer(userId)
    if (!player) return

    const shootType = charactors[player.charactorKey].shootType
    if (readyToShoot && player && shootType) {
      scene.sound.play('shoot')
      socketMethods.clientsInScene(scene.scene.key, methods, 'shoot', {
        builderId: player.id,
        type: shootType,
        options: {
          type: shootType,
          randomNumber: Math.random()
        },
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

    if (this[bulletsRefKey]) {
      Object.keys(this[bulletsRefKey]).forEach(
        id => this[bulletsRefKey][id].update()
      )
    }

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