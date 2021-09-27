import gameConfig from '../../game/config'
import { generateInputForm } from './form'
import { setLocalUserData, getLocalUserData } from '../../user'
import { socketMethods } from '../../index'

function init() {

}

function preload() {

}

function create() {
  const scene = this
  const sceneKey = scene.scene.key
  socketMethods.registerSocketEvents(sceneKey, {})

  const element = this.add.dom(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2).createFromHTML(generateInputForm())
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
        scene.scene.start('dungeon') // should be triggered by server
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