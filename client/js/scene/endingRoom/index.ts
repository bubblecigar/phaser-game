import Phaser from 'phaser'
import waitingScene from '../waitingRoom/index'
import gameState from '../../game/state'
import charactors from '../../charactors/index'
import skins from '../../skins/index'
import setting from '../../../../share/setting.json'

const createWinnerStatue = (scene) => {
  const infoLayer = scene.map.objects.find(layer => layer.name === 'info_layer')
  const winnerPoint = infoLayer.objects.find(object => object.name === 'winner_point')
  const winner = gameState.winner
  const skin = skins[winner.skin]
  const spriteSheetKey = skin.spritesheetConfig.spritesheetKey
  const { size, origin } = skin.matterConfig

  const winnerSprite = scene.add.sprite(winnerPoint.x, winnerPoint.y, spriteSheetKey)
  winnerSprite.setOrigin(origin.x, origin.y)
  winnerSprite.setTint(0xFFD700)
  winnerSprite.setScale(2, 2)

  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(winnerPoint.x, winnerPoint.y, 2 * size.width, 2 * size.height)
  const winnerMatter = scene.matter.add.gameObject(winnerSprite)
  winnerMatter.setExistingBody(rect)


  const winnerName = scene.add.text(winnerPoint.x, winnerPoint.y - 20, winner.name, {
    fontSize: setting.fontSize
  })
  winnerName.setOrigin(0.5, 0.5)
  const title = scene.add.text(winnerPoint.x, winnerPoint.y - 40, "winner", {
    fontSize: setting.fontSize
  })
  title.setOrigin(0.5, 0.5)
}

function create() {
  waitingScene.create.apply(this)

  try {
    createWinnerStatue(this)
  } catch (error) {
    console.log(error)
  }
}

function update(...args) {
  waitingScene.update.apply(this, args)
}

export default {
  key: 'endingRoom',
  init: waitingScene.init,
  preload: waitingScene.preload,
  create,
  update
}