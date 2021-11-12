import Phaser from 'phaser'
import _ from 'lodash'
import PhaserRaycaster from 'phaser-raycaster'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'
import gameConfig from './game/config'
import dungeonScene from './scene/dungeon/index'
import waitingRoomScene from './scene/waitingRoom/index'
import tabPanel from './scene/basescene/tabPanel/index'
import loginScene from './scene/login/index'
import afterEnd from './scene/transitionScene/afterEnd'
import beforeStart from './scene/transitionScene/beforeStart'
import preloadingAssets from './scene/transitionScene/preloadingAssets'
import cards from './scene/basescene/cards/index'
import { connectToServer, getSocketMethods } from './socket'

const aspectRatio = window.innerHeight / window.innerWidth

gameConfig.canvasHeight = gameConfig.canvasWidth * (aspectRatio > 1 ? 1 / aspectRatio : aspectRatio)

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
  input: {
    activePointers: 3,
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
  scene: [loginScene, afterEnd, beforeStart, preloadingAssets, waitingRoomScene, dungeonScene, tabPanel, cards],
  plugins: {
    global: [{
      key: 'rexVirtualJoystick',
      plugin: VirtualJoystickPlugin,
      start: true
    }],
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin'
      }
    ]
  }
})

game.sound.mute = true

const socket = connectToServer()
const socketMethods = getSocketMethods(socket)
socketMethods.registerGameSocketEvents(game)

export default game
export { socketMethods }