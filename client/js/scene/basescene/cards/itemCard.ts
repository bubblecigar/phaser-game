import items from '../../../items/index'
import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { levelUp } from '../playerGrow'

export const drawRandomItemCard = (scene, emptyCard, methods) => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const availableItems = Object.keys(items)
  const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)] || availableItems[0]

  const sprite = scene.add.sprite(0, 0, items[randomItem].spritesheetConfig.spritesheetKey)

  if (items[randomItem].animsConfig?.idle?.key) {
    sprite.play(items[randomItem].animsConfig?.idle?.key)
  }

  const text = scene.add.text(0, 0, randomItem, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(sprite)
  descriptionContainer.add(text)

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.item = randomItem
    levelUp(scene)
  }, scene)
}
