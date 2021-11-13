import gameConfig from '../../game/config'
import formHtml from './form.html'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'
import items from '../../items/index'
import setting from '../../../../share/setting.json'
import { browseSkin, buySkin, activateSkin } from './skins'
import skins from '../../skins/index'

let displayedSkin
const skinBoxSize = 40
const skinBoxCenter = {
  x: 0,
  y: 0
}

function init() {
  skinBoxCenter.x = gameConfig.canvasWidth / 2 - skinBoxSize
  skinBoxCenter.y = gameConfig.canvasHeight / 2 - skinBoxSize / 2
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

const displaySkin = (scene, skin) => {
  if (displayedSkin) {
    displayedSkin.destroy()
  }

  const offsetY = -10
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
}

const updateSkinButtonText = (skinKey, skinButtonText) => {
  const { skins, activatedSkin } = getLocalUserData()

  if (activatedSkin === skinKey) {
    skinButtonText.setText('In use')
  } else if (skins.includes(skinKey)) {
    skinButtonText.setText('Use')
  } else {
    skinButtonText.setText('100 $')
  }
}

const createSkinBox = (scene) => {
  const wallThickness = 2
  const wallColor = 0xffffff
  const leftWall = scene.add.rectangle(skinBoxCenter.x - skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(leftWall, { isStatic: true })
  const rightWall = scene.add.rectangle(skinBoxCenter.x + skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(rightWall, { isStatic: true })
  const topWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y - skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(topWall, { isStatic: true })
  const downWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y + skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(downWall, { isStatic: true })
  const wall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y, skinBoxSize, skinBoxSize)
  wall.setStrokeStyle(2.5, wallColor)

  const skinButton = scene.add.rectangle(rightWall.x + skinBoxSize * 1.1, rightWall.y, skinBoxSize * 1.2, skinBoxSize / 2)
  skinButton.setStrokeStyle(2, 0xffffff)
  const skinButtonText = scene.add.text(skinButton.x, skinButton.y, '', {
    fontSize: '10px'
  })
  skinButtonText.setOrigin(0.5, 0.5)
  skinButton.setInteractive({ cursor: 'pointer' })
  skinButton.on('pointerdown', () => {
    const { skins, activatedSkin } = getLocalUserData()
    const browsedSkin = browseSkin(0)
    if (activatedSkin === browsedSkin.key) {
      // do nothing
    } else if (skins.includes(browsedSkin.key)) {
      activateSkin(browseSkin(0).key)
      updateSkinButtonText(browsedSkin.key, skinButtonText)
    } else {
      buySkin(browseSkin(0).key)
      displayCurrentCoins(scene)
      updateSkinButtonText(browsedSkin.key, skinButtonText)
    }
  })

  const k = 2
  const leftButton = scene.add.triangle(leftWall.x - wallThickness - 2, leftWall.y, 0, -2 * k, 0, 2 * k, -4 * k, 0, 0xffffff)
  leftButton.setOrigin(0, 0)
  leftButton.setInteractive(new Phaser.Geom.Circle(0, 0, 10), Phaser.Geom.Circle.Contains)
  const rightButton = scene.add.triangle(rightWall.x + wallThickness + 2, rightWall.y, 0, -2 * k, 0, 2 * k, 4 * k, 0, 0xffffff)
  rightButton.setOrigin(0, 0)
  rightButton.setInteractive(new Phaser.Geom.Circle(0, 0, 10), Phaser.Geom.Circle.Contains)

  const skin = browseSkin(0)
  displaySkin(scene, skin)
  updateSkinButtonText(skin.key, skinButtonText)

  leftButton.on('pointerdown', () => {
    const skin = browseSkin(-1)
    displaySkin(scene, skin)
    updateSkinButtonText(skin.key, skinButtonText)
  })
  rightButton.on('pointerdown', () => {
    const skin = browseSkin(-1)
    displaySkin(scene, skin)
    updateSkinButtonText(skin.key, skinButtonText)
  })
}

let coinCount
let coin
const displayCurrentCoins = (scene) => {
  const userData = getLocalUserData()
  if (coin) {
    coin.destroy()
  }
  const coinConfig = items.coin
  coin = scene.add.sprite(skinBoxCenter.x + skinBoxSize * 2.5, skinBoxCenter.y, coinConfig.spritesheetConfig.spritesheetKey)
  coin.play(coinConfig.animsConfig.idle.key)
  if (coinCount) {
    coinCount.destroy()
  }
  coinCount = scene.add.text(coin.x + 12, coin.y + 1, `x ${userData.coins}`, {
    fontSize: setting.fontSize
  })
  coinCount.setOrigin(0, 0.5)
  coinCount.setText(`x ${userData.coins}`)
}

function create() {
  const scene = this

  const sceneKey = scene.scene.key
  const logsText = scene.add.text(5, 5, '', {
    fontSize: '6px',
    lineSpacing: 3
  })
  logsText.setOrigin(0, 0)

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

  createSkinBox(scene)
  displayCurrentCoins(scene)

  this.add.dom(0, 0).createFromHTML(formHtml)
  const domElement = scene.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2).createFromHTML(`
  <div class="login">
    <input type="text" placeholder="Username" maxlength="6" id="username" name="username" />
    <input type="text" placeholder="Room-ID" maxlength="6" id="Room-ID" name="Room-ID" />
    <input type="submit" value="Join" name="joinButton" />
  </div>
`)
  domElement.setOrigin(0.5, 0)
  const inputUsername = domElement.getChildByName('username')
  const inputRoomId = domElement.getChildByName('Room-ID')
  const inputSubmit = domElement.getChildByName('joinButton')
  inputUsername.value = getLocalUserData().username || ''
  inputRoomId.value = getLocalUserData().roomId || ''

  domElement.addListener('click')
  domElement.on('click', function (event) {
    if (event.target.name === 'joinButton') {
      if (inputUsername.value !== '' && inputRoomId.value !== '') {
        setLocalUserData({
          username: inputUsername.value,
          roomId: inputRoomId.value
        })
        socketMethods.changeRoom(getLocalUserData())
      }
    }
  }

  // const playbutton = scene.add.rectangle(domElement.x + domElement.width / 4, domElement.y + 17, 15, 15)
  // playbutton.setStrokeStyle(2, 0xffffff)
  // playbutton.setOrigin(0, 0)
  // const k = 2
  // const goIcon = scene.add.triangle(playbutton.x + playbutton.width / 2, playbutton.y + playbutton.height / 2, 0, -2 * k, 0, 2 * k, 4 * k, 0, 0xffffff)
  // goIcon.setOrigin(0.5, 0)
  // playbutton.setInteractive({ cursor: 'pointer' })
  // playbutton.on('pointerup', () => {
  //   inputSubmit.click()
  // })

  const rectangle = scene.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight, gameConfig.canvasWidth, 5)
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