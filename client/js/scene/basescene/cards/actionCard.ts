import { actions } from '../../../actions/index'
import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'

export const drawRandomActionCard = (scene, emptyCard, methods) => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const availableActions = Object.keys(actions)
  const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)] || availableActions[0]

  const target = scene.matter.add.image(0, 0, 'target')
  target.setIgnoreGravity(true)
  target.setAngularVelocity(0.05)
  target.setScale(1.5, 1.5)
  target.setFriction(0, 0, 0)

  const text = scene.add.text(0, 0, randomAction, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(target)
  descriptionContainer.add(text)

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    player.action = randomAction
    scene.scene.stop()
  }, scene)
}
