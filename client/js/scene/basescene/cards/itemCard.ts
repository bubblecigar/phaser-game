import items from '../../../items/index'
import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { levelUp } from './level'

export const drawItemCard = (scene, emptyCard, methods) => item => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const sprite = scene.add.sprite(0, 0, items[item].spritesheetConfig.spritesheetKey)

  if (items[item].animsConfig?.idle?.key) {
    sprite.play(items[item].animsConfig?.idle?.key)
  }

  const text = scene.add.text(0, 0, item, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(sprite)
  descriptionContainer.add(text)

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.item = item
    levelUp(scene)
  }, scene)
}
