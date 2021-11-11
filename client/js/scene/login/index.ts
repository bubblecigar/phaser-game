import gameConfig from '../../game/config'
import formHtml from './form.html'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'
import items from '../../items/index'
import setting from '../../../../share/setting.json'
import { browseSkin, buySkin, activateSkin } from './skins'
import skins from '../../skins/index'

function init() {
}

function preload() {
  Object.keys(skins).forEach(
    key => {
      const skin = skins[key]
      this.load.spritesheet(skin.spritesheetConfig.spritesheetKey, skin.spritesheetConfig.spritesheetUrl, skin.spritesheetConfig.options)
    }
  )
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      this.load.spritesheet(item.spritesheetConfig.spritesheetKey, item.spritesheetConfig.spritesheetUrl, item.spritesheetConfig.options)
    }
  )
}

let element


const updateSkinButton = (skinKey, skinButton) => {
  const { skins, activatedSkin } = getLocalUserData()

  if (activatedSkin === skinKey) {
    skinButton.textContent = 'Activated'
    skinButton.name = 'activated'
    skinButton.className = 'activated'
  } else if (skins.includes(skinKey)) {
    skinButton.textContent = 'Activate'
    skinButton.name = 'activate'
    skinButton.className = 'activate'
  } else {
    skinButton.textContent = `100 coins`
    skinButton.name = 'buy'
    skinButton.className = 'buy'
  }
}

let displayedSkin
const skinBoxCenter = {
  x: gameConfig.canvasWidth / 2 - 27,
  y: gameConfig.canvasHeight / 2 - 5
}
const displaySkin = (scene, skin, skinButton) => {
  if (displayedSkin) {
    displayedSkin.destroy()
  }

  const offsetY = -20
  const sprite = scene.add.sprite(skinBoxCenter.x, skinBoxCenter.y + offsetY)
  const { size, origin } = skin.matterConfig
  displayedSkin = scene.matter.add.gameObject(sprite, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    shape: {
      type: 'rectangle',
      width: size.width,
      height: size.height
    }
  })
  sprite.setOrigin(origin.x, origin.y)
  sprite.play(skins[skin.key].animsConfig.idle.key)
  displayedSkin.setBounce(1)

  updateSkinButton(skin.key, skinButton)
}
const createSkinBoundingBox = (scene) => {
  const skinBoxSize = 40
  const wallThickness = 5
  const leftWall = scene.add.rectangle(skinBoxCenter.x - skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(leftWall, { isStatic: true })
  const rightWall = scene.add.rectangle(skinBoxCenter.x + skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(rightWall, { isStatic: true })
  const topWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y - skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(topWall, { isStatic: true })
  const downWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y + skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(downWall, { isStatic: true })
}

let coinCount
let coin
const displayCurrentCoins = (scene) => {
  const userData = getLocalUserData()
  if (coin) {
    coin.destroy()
  }
  const coinConfig = items.coin
  const padding = 42
  coin = scene.add.sprite(padding, padding, coinConfig.spritesheetConfig.spritesheetKey)
  coin.play(coinConfig.animsConfig.idle.key)
  if (coinCount) {
    coinCount.destroy()
  }
  coinCount = scene.add.text(padding + 8, padding + 1, `x ${userData.coins}`, {
    fontSize: setting.fontSize
  })
  coinCount.setOrigin(0, 0.5)
  coinCount.setText(`x ${userData.coins}`)
}

function create() {
  const scene = this

  const sceneKey = scene.scene.key
  const logsText = scene.add.text(5, gameConfig.canvasHeight - 5, '', {
    fontSize: setting.fontSize,
    lineSpacing: 5
  })
  logsText.setOrigin(0, 1)

  socketMethods.registerSceneSocketEvents(sceneKey, {
    updateRoomLog: (logs) => {
      const allMessages = logs.join('\n')
      logsText.setText(allMessages)
    }
  })

  Object.keys(skins).forEach(
    key => {
      const skin = skins[key]
      Object.keys(skin.animsConfig).forEach(
        _key => {
          const animConfig = skin.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(skin.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
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

  element = this.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.6).createFromHTML(formHtml)
  const inputUsername = element.getChildByName('username')
  const inputRoomId = element.getChildByName('Room-ID')
  inputUsername.value = getLocalUserData().username || ''
  inputRoomId.value = getLocalUserData().roomId || ''

  const skinButton = element.getChildByID('skin-button')

  createSkinBoundingBox(scene)
  const currentSkin = browseSkin(0)
  displaySkin(scene, currentSkin, skinButton)

  displayCurrentCoins(scene)

  element.addListener('click')
  element.on('click', function (event) {
    if (event.target.name === 'skin-left') {
      const skin = browseSkin(-1)
      displaySkin(scene, skin, skinButton)
    } else if (event.target.name === 'skin-right') {
      const skin = browseSkin(1)
      displaySkin(scene, skin, skinButton)
    } else if (event.target.name === 'joinButton') {
      if (inputUsername.value !== '' && inputRoomId.value !== '') {
        setLocalUserData({
          username: inputUsername.value,
          roomId: inputRoomId.value
        })
        socketMethods.changeRoom(getLocalUserData())
      }
    } else if (event.target.name === 'buy') {
      buySkin(browseSkin(0).key)
      displayCurrentCoins(scene)
      updateSkinButton(browseSkin(0).key, skinButton)
    } else if (event.target.name === 'activate') {
      // activate the skin
      activateSkin(browseSkin(0).key)
      updateSkinButton(browseSkin(0).key, skinButton)
    }
  })

  const rectangle = scene.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight, gameConfig.canvasWidth * 0.45 + 20, 65)
  scene.matter.add.gameObject(rectangle, {
    isStatic: true
  })

  generateRandomCharactor(this)
  this.time.addEvent({
    callback: generateRandomCharactor(this),
    callbackScope: this,
    delay: 1000,
    loop: true
  })

  socketMethods.updateRoomLog()
  scene.time.addEvent({
    delay: 1000,
    callback: socketMethods.updateRoomLog,
    callbackScope: scene,
    loop: true
  })

  // socketMethods.changeRoom(getLocalUserData())
}

const randomSkins = []
const generateRandomCharactor = scene => () => {
  const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * Object.keys(skins).length) % (Object.keys(skins).length)]
  const skin = skins[randomSkinKey]
  const { size, origin } = skin.matterConfig

  const randomX = gameConfig.canvasWidth / 2 + gameConfig.canvasWidth * 0.4 * (Math.random() - 0.5)
  const sprite = scene.add.sprite(randomX, -20)
  const matter = scene.matter.add.gameObject(sprite, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    shape: {
      type: 'rectangle',
      width: size.width,
      height: size.height
    }
  })
  sprite.setOrigin(origin.x, origin.y)
  sprite.play(skin.animsConfig.idle.key)
  matter.setBounce(1)
  randomSkins.push(matter)

  scene.time.delayedCall(
    1500,
    () => {
      const randomVX = (Math.random() - 0.5) * 5
      matter.setVelocityX(randomVX)
      if (randomVX < 0) {
        matter.setFlipX(true)
      }
    },
    null,
    scene
  )

  if (randomSkins.length > 15) {
    const charToRemove = randomSkins.shift()
    charToRemove.destroy()
  }
}

function update(t, dt) {
}

export default {
  key: 'loginScene',
  init,
  preload,
  create,
  update
}