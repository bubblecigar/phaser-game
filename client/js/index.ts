import Phaser from 'phaser'
import _ from 'lodash'
import PhaserRaycaster from 'phaser-raycaster'
import gameConfig from './game/config'
import dungeonScene from './scene/dungeon/index'
import waitingRoomScene from './scene/waitingRoom/index'
import GUIScene from './scene/dungeon/GUI'
import loginScene from './scene/login/index'
import { connectToServer, getSocketMethods } from './socket'

const socket = connectToServer()
const socketMethods = getSocketMethods(socket)

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: gameConfig.canvasWidth,
  height: gameConfig.canvasHeight,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: {
        y: 1
      },
      // debug: {
      //   showBody: true,
      //   showStaticBody: true
      // }
    }
  },
  parent: 'phaser-container',
  dom: {
    createContainer: true
  },
  scene: [loginScene, waitingRoomScene, dungeonScene, GUIScene],
  // scene: [dungeonScene, GUIScene],
  plugins: {
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin'
      }
    ]
  }
})

export default game
export { socketMethods }