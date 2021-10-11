import Phaser from 'phaser'
import basescene from '../share/index'
import gameState from '../../game/state'
import charactors from '../../charactors/index'
import setting from '../../../../share/setting.json'

function create() {
  basescene.create.apply(this)

  try {
    const infoLayer = this.map.objects.find(layer => layer.name === 'info_layer')
    const winnerPoint = infoLayer.objects.find(object => object.name === 'winner_point')
    const winner = gameState.winner
    const charactor = charactors[winner.charactorKey]
    const spriteSheetKey = charactor.spritesheetConfig.spritesheetKey
    const { size, origin } = charactor.matterConfig

    const winnerSprite = this.add.sprite(winnerPoint.x, winnerPoint.y, spriteSheetKey)
    winnerSprite.setOrigin(origin.x, origin.y)
    winnerSprite.setTint(0xFFD700)
    winnerSprite.setScale(2, 2)

    const Bodies = Phaser.Physics.Matter.Matter.Bodies
    const rect = Bodies.rectangle(winnerPoint.x, winnerPoint.y, 2 * size.width, 2 * size.height, { label: 'player-body' })
    const winnerMatter = this.matter.add.gameObject(winnerSprite)
    winnerMatter.setExistingBody(rect)


    const winnerName = this.add.text(winnerPoint.x, winnerPoint.y - 20, winner.name, {
      fontSize: setting.fontSize
    })
    winnerName.setOrigin(0.5, 0.5)
    const title = this.add.text(winnerPoint.x, winnerPoint.y - 40, "winner", {
      fontSize: setting.fontSize
    })
    title.setOrigin(0.5, 0.5)
  } catch (error) {
    console.log(error)
  }
}

function update(...args) {
  basescene.update.apply(this, args)
}

export default {
  key: 'endingRoom',
  init: basescene.init,
  preload: basescene.preload,
  create,
  update
}