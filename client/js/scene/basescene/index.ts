import _ from 'lodash'
import gameMethods from './methods/index'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import clientMap from '../../../../share/clientMap'
import backgroundMap from './backgroundMap'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import targetUrl from '../../../statics/tile/target.png'
import { socketMethods } from '../../index'
import setting from '../../../../share/setting.json'
import { itemsStorageKey } from '../../actions/index'
import collisionCategories from './collisionCategories'
import { sounds } from '../../sounds/index'

const userId = getLocalUserData().userId

let methods
let cursors, pointer
let aim, aimDirection
let readyToShoot = true
let restTime = 0

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
  const { movementSpeed } = player.attributes
  const velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    velocity.x = -movementSpeed
  } else if (cursors.right.isDown) {
    velocity.x = movementSpeed
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

function init() {
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
  methods.createMonsters()

  const scene = this
  cursors.up.on(
    'down', () => {
      const player = methods.getPlayer(userId)
      const playerData = player.phaserObject.data.values
      if (player.health && playerData.touched) {
        if (!playerData.touchTop) {
          scene.sound.play('quickJump')
          player.phaserObject.setVelocityY(-(4 + player.attributes.jump))
          player.phaserObject.setVelocityX(playerData.touchLeft ? 0.1 : -0.1)
          player.phaserObject.setData({ touched: false })
        }
      }
    }
  )
  this.input.on('pointerdown', function () {
    const player = methods.getPlayer(userId)
    if (!player || player.health <= 0) return

    if (readyToShoot && player) {
      scene.sound.play('shoot')
      socketMethods.clientsInScene(scene.scene.key, methods, 'performAction', {
        performerId: player.id,
        action: player.action,
        target: { x: aim.x, y: aim.y },
        options: {
          item: player.item,
          randomNumber: Math.random()
        }

      })
      readyToShoot = false
      scene.time.delayedCall(
        500 / player.attributes.attackSpeed,
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
    if (player.health > 0) {
      movePlayer(this, player)
    }
    updateAim(this, player)

    if (this[itemsStorageKey]) {
      Object.keys(this[itemsStorageKey]).forEach(
        id => {
          try {
            this[itemsStorageKey][id].update(t, dt)
          } catch (error) {
            delete this[itemsStorageKey][id]
          }
        }
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
    } else {
      if (restTime >= setting.healInterval) {
        restTime = 0
        socketMethods.clientsInScene(this.scene.key, methods, 'onHeal', userId, player.attributes.maxHealth * player.attributes.healthRegen * 0.01)
      }
      restTime += dt
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