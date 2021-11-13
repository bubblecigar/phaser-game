import _ from 'lodash'
import gameMethods from './methods/index'
import gameConfig from '../../game/config'
import { Player } from '../../Interface'
import { getLocalUserData } from '../../user'
import { maps } from '../../../../share/clientMap'
import backgroundMap from './backgroundMap'
import registerWorldEvents from './WorldEvents'
import registerInputEvents from './inputEvents'
import soundIconUrl from '../../../statics/soundIcon.png'
import targetUrl from '../../../statics/tile/target.png'
import { socketMethods } from '../../index'
import setting from '../../../../share/setting.json'
import { itemsStorageKey } from '../../actions/index'
import { sounds } from '../../sounds/index'
import { popText } from './popText'
import items from '../../items/index'
import { isMobile } from '../../deviceDetection'
import gameState from '../../game/state'

const userId = getLocalUserData().userId

let methods
let mapKey
let cursors, wasd, joyStick
let readyToShoot = true
let restTime = 0

const movePlayer = (scene, player: Player) => {
  const { movementSpeed } = player.attributes
  const velocity = { x: 0, y: 0 }
  if (cursors.left.isDown || wasd.a.isDown || joyStick?.left) {
    velocity.x = -movementSpeed
  } else if (cursors.right.isDown || wasd.d.isDown || joyStick?.right) {
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

  let newDirection = player.velocity.x < 0 ? 'left' : 'right'
  if (player.velocity.x === 0) {
    newDirection = 'none'
  }
  let oldDirection = prevVelocity < 0 ? 'left' : 'right'
  if (prevVelocity === 0) {
    oldDirection = 'none'
  }
  const changeDirection = oldDirection !== newDirection
  if (changeDirection && newDirection !== 'none') {
    socketMethods.clientsInScene(scene.scene.key, methods, 'updatePlayerDirection', userId, newDirection)
  }
}

function init(data) {
  methods = gameMethods(this)
  mapKey = data.mapKey
  readyToShoot = true
}

function preload() {
  this.load.image('soundIcon', soundIconUrl)
  this.load.image('target', targetUrl)
  const mapConfig = maps[mapKey]
  this.load.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  this.load.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)


  Object.keys(sounds).forEach(
    key => {
      this.load.audio(key, sounds[key].url)
    }
  )
}

const registerMobileInputs = (scene, jump, shoot) => {

  const dmgColor = Phaser.Display.Color.HexStringToColor("#990f02").color;

  const baseRadius = gameConfig.canvasWidth / 10
  const base = scene.add.circle(0, 0, baseRadius, 0xffffff)
  const thumb = scene.add.circle(0, 0, baseRadius / 2, dmgColor)
  base.setDepth(100)
  base.setAlpha(0.2)
  thumb.setDepth(101)
  thumb.setAlpha(0.7)
  joyStick = scene.plugins.get('rexVirtualJoystick').add(scene, {
    x: baseRadius,
    y: gameConfig.canvasHeight - baseRadius,
    radius: gameConfig.canvasWidth / 4,
    base,
    thumb,
    dir: 'left&right',
    forceMin: 1,
    // fixed: true,
    // enable: true
  })

  const clickbuttonRadius = baseRadius * 0.7
  const jumpbutton = scene.add.circle(gameConfig.canvasWidth - 2.5 * clickbuttonRadius, gameConfig.canvasHeight - clickbuttonRadius, clickbuttonRadius, 0xffffff)
  jumpbutton.setScrollFactor(0)
  jumpbutton.setDepth(100)
  jumpbutton.setAlpha(0.2)
  jumpbutton.setInteractive()
  jumpbutton.on('pointerdown', jump)
  const jumpIcon = scene.add.text(jumpbutton.x, jumpbutton.y, '↑', {
    fontSize: '25px',
    color: "#ffffff"
  })
  jumpIcon.setAlpha(0.7)
  jumpIcon.setOrigin(0.5, 0.5)
  jumpIcon.setDepth(101)
  jumpIcon.setScrollFactor(0)

  const shootbutton = scene.add.circle(jumpbutton.x + 1.6 * clickbuttonRadius, jumpbutton.y - 1.6 * clickbuttonRadius, clickbuttonRadius, dmgColor)
  shootbutton.setScrollFactor(0)
  shootbutton.setDepth(100)
  shootbutton.setAlpha(0.5)
  shootbutton.setInteractive()
  shootbutton.on('pointerdown', shoot)
  const player = methods.getPlayer(userId)
  shootItem = scene.add.sprite(jumpbutton.x + 1.6 * clickbuttonRadius, jumpbutton.y - 1.6 * clickbuttonRadius, items[player.item].spritesheetConfig.spritesheetKey)
  shootItem.setScrollFactor(0)
  shootItem.setDepth(101)
}

let shootItem
const changeShootButton = (spriteKey) => {
  if (shootItem) {
    shootItem.setTexture(spriteKey)
  }
}

const addBgmusicButton = (scene) => {
  const bgmusicButton = scene.add.image(10, 10, 'soundIcon')
  bgmusicButton.setScale(0.6)
  bgmusicButton.setScrollFactor(0)
  bgmusicButton.setDepth(100)
  bgmusicButton.setInteractive()
  const bgmusic = document.getElementById('bgmusic')
  if (bgmusic.muted) {
    bgmusicButton.setAlpha(0.3)
  } else {
    bgmusicButton.setAlpha(0.9)
  }
  bgmusicButton.on('pointerdown', () => {
    bgmusic.muted = !bgmusic.muted
    if (bgmusic.muted) {
      bgmusicButton.setAlpha(0.3)
      scene.game.sound.mute = true
      bgmusic.muted = true
    } else {
      bgmusicButton.setAlpha(0.9)
      bgmusic.muted = false
      bgmusic.volume = 0.4
      bgmusic.play()
      scene.game.sound.mute = false
    }
  })
}

const createStatusBar = (scene) => {
  const coin = scene.add.sprite(gameConfig.canvasWidth / 2, 10,
    items.coin.spritesheetConfig.spritesheetKey)
  coin.setScrollFactor(0)
  coin.setOrigin(0.5, 0.5)
  coin.play(items.coin.animsConfig.idle.key)
  coin.setDepth(100)

  const redcoinCount = scene.add.text(coin.x - 10, coin.y + 1, '0', {
    fontSize: '10px'
  })
  redcoinCount.setOrigin(1, 0.5)
  redcoinCount.setScrollFactor(0)
  redcoinCount.setDepth(100)
  const bluecoinCount = scene.add.text(coin.x + 10, coin.y + 1, '0', {
    fontSize: '10px'
  })
  bluecoinCount.setOrigin(0, 0.5)
  bluecoinCount.setScrollFactor(0)
  bluecoinCount.setDepth(100)

  scene.redcoinCount = redcoinCount
  scene.bluecoinCount = bluecoinCount
}

const updateStatusBar = (scene) => {
  if (!scene.redcoinCount || !scene.bluecoinCount) {
    return
  }
  let redcoins = 0
  let bluecoins = 0
  gameState.players.forEach(
    player => {
      if (player.team === 'red') {
        redcoins += player.coins
      }
      if (player.team === 'blue') {
        bluecoins += player.coins
      }
    }
  )
  scene.redcoinCount.setText(redcoins)
  scene.bluecoinCount.setText(bluecoins)
}

function create() {
  addBgmusicButton(this)
  createStatusBar(this)
  this.time.addEvent({
    delay: 200,
    callback: () => updateStatusBar(this),
    callbackScope: this,
    loop: true
  })

  cursors = this.input.keyboard.createCursorKeys()
  wasd = this.input.keyboard.addKeys({
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    w: Phaser.Input.Keyboard.KeyCodes.W,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE
  })
  backgroundMap.registerMap(this, maps[mapKey])

  socketMethods.registerSceneSocketEvents(this.scene.key, methods)
  registerWorldEvents(this, methods, socketMethods)
  registerInputEvents(this, methods, socketMethods)

  methods.createPlayers()
  methods.createItems()
  methods.createMonsters()

  const scene = this
  const jump = () => {
    const player = methods.getPlayer(userId)
    if (player.health) {
      const previousPositionImpulse = player.phaserObject.body.previousPositionImpulse
      if (Math.abs(previousPositionImpulse.x) >= 0.001 || previousPositionImpulse.y <= -0.001) {
        scene.sound.play('quickJump')
        player.phaserObject.setVelocityY(-(4 + player.attributes.jump))
      }
    }
  }
  cursors.up.on('down', jump)
  wasd.w.on('down', jump)

  const shoot = () => {
    const player = methods.getPlayer(userId)
    if (!player || player.health <= 0) return

    const sprite = player.phaserObject.getByName('charactor-sprite')
    const direction = sprite.flipX ? -1 : 1

    if (readyToShoot && player) {
      scene.sound.play('shoot')
      socketMethods.clientsInScene(scene.scene.key, methods, 'performAction', {
        performerId: player.id,
        action: player.action,
        target: { x: player.position.x + 50 * direction, y: player.position.y },
        options: {
          item: player.item,
          damage: player.attributes.damage,
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
  }
  wasd.space.on('down', shoot)
  if (isMobile) {
    registerMobileInputs(this, jump, shoot)
  }
}

function update(t, dt) {
  try {
    const player = methods.getPlayer(userId)
    if (!player || !player.phaserObject) return
    backgroundMap.updateFOV(this, player.position)
    if (player.health > 0) {
      movePlayer(this, player)
    }

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
    const emittablePlayer = _.omit(player, 'phaserObject', 'team')
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
      const isInFountain = player.phaserObject.data.values.isInFountain
      const healInterval = isInFountain ? setting.fountainHealingInterval : setting.healInterval
      if (restTime >= healInterval) {
        restTime = 0
        const heal = 5 * player.attributes.maxHealth * player.attributes.healthRegen * 0.01
        socketMethods.clientsInScene(this.scene.key, methods, 'onHeal', userId, heal)
        popText(this, player.position, `+${heal.toFixed(0)}`, { fontSize: '8px', color: gameConfig.healColor })
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

export { changeShootButton }
