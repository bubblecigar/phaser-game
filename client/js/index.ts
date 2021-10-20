import Phaser from 'phaser'
import _ from 'lodash'
import PhaserRaycaster from 'phaser-raycaster'
import gameConfig from './game/config'
import dungeonScene from './scene/dungeon/index'
import waitingRoomScene from './scene/waitingRoom/index'
import endingRoomScene from './scene/endingRoom/index'
import GUIScene from './scene/GUI/index'
import loginScene from './scene/login/index'
import endgameReport from './scene/endgameReport/index'
import { connectToServer, getSocketMethods } from './socket'

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: gameConfig.canvasWidth,
  height: gameConfig.canvasHeight,
  pixelArt: true,
  transparent: true,
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
  scene: [loginScene, waitingRoomScene, dungeonScene, endgameReport, endingRoomScene, GUIScene],
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

const socket = connectToServer()
const socketMethods = getSocketMethods(socket)
socketMethods.registerGameSocketEvents(game)

export default game
export { socketMethods }