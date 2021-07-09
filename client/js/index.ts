import Phaser from 'phaser'
import _ from 'lodash'
import PhaserRaycaster from 'phaser-raycaster'
import { gameConfig } from '../../share/game'
import './socket'
import dungeonScene from './scene/dungeon'

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
      debug: {
        showBody: true,
        showStaticBody: true
      }
    }
  },
  scene: [dungeonScene],
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