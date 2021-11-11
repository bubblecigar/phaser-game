import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'

export const drawAttributeCard = (scene, emptyCard, methods, onFinished) => attribute => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard
  const property = scene.add.text(0, 0, attribute.property, {
    fontSize: setting.fontSize
  })
  property.setOrigin(0.5, 0.5)

  const valueText = `${attribute.value > 0 ? '+' : '-'} ${Math.abs(attribute.value)}`
  const value = scene.add.text(0, 0, valueText, {
    fontSize: setting.fontSize
  })
  value.setOrigin(0.5, 0.5)

  imageContainer.add(property)
  descriptionContainer.add(value)

  itemCell.on('pointerup', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.attributes[attribute.property] += attribute.value
    onFinished()
  }, scene)

  return itemCell
}
