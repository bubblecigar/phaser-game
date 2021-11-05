import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'

export const drawActionCard = (scene, emptyCard, methods, onFinished) => action => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const target = scene.matter.add.image(0, 0, 'target')
  target.setFriction(0, 0, 0)
  target.setSensor(true)
  target.setIgnoreGravity(true)
  target.setAngularVelocity(0.05)
  target.setScale(1.5, 1.5)

  const text = scene.add.text(0, 0, action, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(target)
  descriptionContainer.add(text)

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.action = action
    onFinished()
  }, scene)

  return itemCell
}
