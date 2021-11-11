import skins from '../../../skins/index'
import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'

export const drawSkinCard = (scene, emptyCard, methods, onFinished) => skin => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const sprite = scene.add.sprite(0, 0, skins[skin].spritesheetConfig.spritesheetKey)

  if (skins[skin].animsConfig?.idle?.key) {
    sprite.play(skins[skin].animsConfig?.idle?.key)
  }

  const text = scene.add.text(0, 0, skin, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(sprite)
  descriptionContainer.add(text)

  itemCell.on('pointerup', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.skin = skin
    onFinished()
  }, scene)

  return itemCell
}
