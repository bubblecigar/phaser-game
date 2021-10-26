import gameConfig from '../../game/config'
import { generateInputForm } from './form'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'
import charactors from '../../charactors/index'
import items from '../../items/index'
import bgmusicUrl from '../../../statics/sound/game-music-7408.mp3'
import setting from '../../../../share/setting.json'

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

function create() {
  const scene = this

  const sceneKey = scene.scene.key
  const logsText = scene.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 - 32, '', {
    fontSize: setting.fontSize,
    lineSpacing: 5
  })
  logsText.setOrigin(0.5, 1)

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

  element = this.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.6).createFromHTML(generateInputForm())
  const inputUsername = element.getChildByName('username')
  const inputRoomId = element.getChildByName('Room-ID')
  inputUsername.value = getLocalUserData().username || ''
  inputRoomId.value = getLocalUserData().roomId || ''

  const soundCheckBox = element.getChildByName('sound-checkbox')
  soundCheckBox.checked = bgmusic ? !bgmusic.mute : false

  element.addListener('click')
  element.on('click', function (event) {
    if (event.target.name === 'joinButton') {
      if (inputUsername.value !== '' && inputRoomId.value !== '') {
        setLocalUserData({
          username: inputUsername.value,
          roomId: inputRoomId.value
        })
        socketMethods.changeRoom(inputRoomId.value)
        scene.scene.stop('GUI')
        scene.scene.launch('GUI')
      }
    } else if (event.target.name === 'sound-checkbox') {
      if (event.target.checked) {
        if (bgmusic.isPlaying) {
          bgmusic.setMute(false)
        } else {
          bgmusic.play({
            loop: true,
            volume: 0.3
          })
        }
      } else {
        bgmusic.setMute(true)
      }
    } else if (event.target.dataset.roomId) {
      setLocalUserData({
        username: inputUsername.value,
        roomId: event.target.dataset.roomId
      })
      socketMethods.changeRoom(event.target.dataset.roomId)
      scene.scene.stop('GUI')
      scene.scene.launch('GUI')
    }
  })

  const rectangle = scene.add.rectangle(gameConfig.canvasWidth / 2 + 5, gameConfig.canvasHeight * 0.71, gameConfig.canvasWidth * 0.45, 100)
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

  if (!bgmusic) {
    this.load.audio('background_music', bgmusicUrl)
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      bgmusic = this.sound.add('background_music')
    })
    this.load.start()
  }

  socketMethods.updateRoomLog()
  scene.time.addEvent({
    delay: 1000,
    callback: socketMethods.updateRoomLog,
    callbackScope: scene,
    loop: true
  })
}

let bgmusic

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