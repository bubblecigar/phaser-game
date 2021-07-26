import Phaser from 'phaser'
import _ from 'lodash'
import PhaserRaycaster from 'phaser-raycaster'
import gameConfig from './game/config'
import dungeonScene from './scene/dungeon/index'
import GUIScene from './scene/dungeon/GUI'
import loginScene from './scene/login/index'

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
        y: 0
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
  scene: [loginScene, dungeonScene, GUIScene],
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