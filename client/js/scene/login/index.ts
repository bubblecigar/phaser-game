import gameConfig from '../../game/config'
import { generateInputForm } from './form'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'
import charactors from '../../charactors/index'

function init() {

}

function preload() {
  Object.keys(charactors).forEach(
    key => {
      const char = charactors[key]
      this.load.spritesheet(char.spritesheetConfig.spritesheetKey, char.spritesheetConfig.spritesheetUrl, char.spritesheetConfig.options)
    }
  )
}

function create() {
  const scene = this

  const sceneKey = scene.scene.key
  socketMethods.registerSceneSocketEvents(sceneKey, {})

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

  const element = this.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight * 0.6).createFromHTML(generateInputForm())
  const inputUsername = element.getChildByName('username')
  const inputRoomId = element.getChildByName('Room-ID')
  inputUsername.value = getLocalUserData().username || ''
  inputRoomId.value = getLocalUserData().roomId || ''
  element.addListener('click')
  element.on('click', function (event) {
    if (event.target.name === 'joinButton') {

      if (inputUsername.value !== '' && inputRoomId.value !== '') {
        setLocalUserData({
          username: inputUsername.value,
          roomId: inputRoomId.value
        })
        socketMethods.changeRoom(inputRoomId.value)
      }
    }

  })
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