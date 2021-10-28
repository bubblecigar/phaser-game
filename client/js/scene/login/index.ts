import gameConfig from '../../game/config'
import formHtml from './form.html'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'
import charactors from '../../charactors/index'
import items from '../../items/index'
import setting from '../../../../share/setting.json'
import { browseSkin } from './skins'

function init() {
}

function preload() {
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

let element


let displayedSkin
const displaySkin = (scene, skin) => {
  if (displayedSkin) {
    displayedSkin.destroy()
  }

  const offsetY = -20
  const sprite = scene.add.sprite(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + offsetY)
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
  sprite.play(skin.animsConfig.idle.key)
  displayedSkin.setBounce(1)
}

const createSkinBoundingBox = (scene) => {
  const skinBoxSize = 40
  const wallThickness = 5
  const skinBoxCenter = {
    x: gameConfig.canvasWidth / 2,
    y: gameConfig.canvasHeight / 2 - 16
  }
  const leftWall = scene.add.rectangle(skinBoxCenter.x - skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(leftWall, { isStatic: true })
  const rightWall = scene.add.rectangle(skinBoxCenter.x + skinBoxSize / 2, skinBoxCenter.y, wallThickness, skinBoxSize + wallThickness)
  scene.matter.add.gameObject(rightWall, { isStatic: true })
  const topWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y - skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(topWall, { isStatic: true })
  const downWall = scene.add.rectangle(skinBoxCenter.x, skinBoxCenter.y + skinBoxSize / 2, skinBoxSize + wallThickness, wallThickness)
  scene.matter.add.gameObject(downWall, { isStatic: true })
}

function create() {
  const scene = this

  const sceneKey = scene.scene.key
  const logsText = scene.add.text(32, gameConfig.canvasHeight - 5, '', {
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

  element = this.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.6).createFromHTML(formHtml)
  const inputUsername = element.getChildByName('username')
  const inputRoomId = element.getChildByName('Room-ID')
  inputUsername.value = getLocalUserData().username || ''
  inputRoomId.value = getLocalUserData().roomId || ''

  const bgmusic = document.getElementById('bgmusic')


  createSkinBoundingBox(scene)
  const currentSkin = browseSkin(0)
  displaySkin(scene, currentSkin)

  element.addListener('click')
  element.on('click', function (event) {
    if (event.target.name === 'skin-left') {
      const skin = browseSkin(-1)
      displaySkin(scene, skin)
    } else if (event.target.name === 'skin-right') {
      const skin = browseSkin(1)
      displaySkin(scene, skin)
    } else if (event.target.name === 'joinButton') {
      if (inputUsername.value !== '' && inputRoomId.value !== '') {
        setLocalUserData({
          username: inputUsername.value,
          roomId: inputRoomId.value
        })
        socketMethods.changeRoom(getLocalUserData())
        scene.scene.stop('GUI')
        scene.scene.launch('GUI')
      }
    } else if (event.target.name === 'sound-checkbox') {
      if (event.target.checked) {
        bgmusic.muted = false
        bgmusic.volume = 0.4
        bgmusic.play()
        scene.game.sound.mute = false
      } else {
        scene.game.sound.mute = true
        bgmusic.muted = true
      }
    }
  })

  const rectangle = scene.add.rectangle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.73, gameConfig.canvasWidth * 0.45, 100)
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
}

const randomCharactors = []
const generateRandomCharactor = scene => () => {
  const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * Object.keys(charactors).length) % (Object.keys(charactors).length)]
  const charactorConfig = charactors[randomCharactorKey]
  const { size, origin } = charactorConfig.matterConfig

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
  sprite.play(charactorConfig.animsConfig.idle.key)
  matter.setBounce(1)
  randomCharactors.push(matter)

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

  if (randomCharactors.length > 15) {
    const charToRemove = randomCharactors.shift()
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