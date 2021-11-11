import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'
import skull from '../../../skins/skull'

export const drawResurrectCard = (scene, emptyCard, methods, onFinished) => () => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const target = scene.matter.add.sprite(0, 0, skull.spritesheetConfig.spritesheetKey)
  target.setFriction(0, 0, 0)
  target.setSensor(true)
  target.setIgnoreGravity(true)

  const text = scene.add.text(0, 0, 'resurrect', {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(target)
  descriptionContainer.add(text)

  itemCell.on('pointerup', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.skin = getLocalUserData().activatedSkin
    player.exp = 0
    player.level = 0
    player.action = 'tab'
    player.item = 'dagger'
    onFinished()
  }, scene)

  return itemCell
}
