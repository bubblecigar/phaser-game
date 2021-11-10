import _ from 'lodash'
import gameConfig from '../../game/config'
import setting from '../../../../share/setting.json'
import skins from '../../skins/index'
import clientMap from '../../../../share/clientMap'
import targetUrl from '../../../statics/tile/target.png'
import { sounds } from '../../sounds/index'

function init() {

}

function preload() {
  const randomSkinKey = Object.keys(skins)[Math.floor(Math.random() * 10) % (Object.keys(skins).length)]
  const skin = skins[randomSkinKey]
  this.randomSkin = skin
}

function create() {
  const padding = 32

  const centerX = gameConfig.canvasWidth / 2
  const centerY = gameConfig.canvasHeight / 2

  this.transitionScreen = this.add.container(0, 0)
  const text = this.add.text(centerX, centerY, 'loading...', {
    fontSize: setting.fontSize
  })
  const char = this.add.sprite(centerX - padding, centerY, this.randomSkin.spritesheetConfig.spritesheetKey)
  char.play(this.randomSkin.animsConfig.move.key)

  this.transitionScreen.add([text, char])

  const scene = this
  const loader = new Phaser.Loader.LoaderPlugin(this);
  loader.image('target', targetUrl)
  const mapConfig = clientMap['dungeon']
  loader.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  loader.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)
  Object.keys(sounds).forEach(
    key => {
      loader.audio(key, sounds[key].url)
    }
  )
  loader.once(Phaser.Loader.Events.COMPLETE, () => {
    scene.scene.start('waitingRoom', { mapKey: 'readyRoom' })
  });
  loader.start()
}

function update() {

}

export default {
  key: 'preloadingAssets',
  init,
  preload,
  create,
  update
}