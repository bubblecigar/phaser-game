import { actions } from '../../../actions/index'
import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'

export const drawRandomAttributeCard = (scene, emptyCard, methods) => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const availableAttributes = [
    {
      property: 'maxHealth',
      value: 5
    },
    {
      property: 'movementSpeed',
      value: 1
    },
    {
      property: 'vision',
      value: 10
    }
  ]

  const randomAttribute = availableAttributes[Math.floor(Math.random() * availableAttributes.length)] || availableAttributes[0]

  const property = scene.add.text(0, 0, randomAttribute.property, {
    fontSize: setting.fontSize
  })
  property.setOrigin(0.5, 0.5)

  const valueText = `${randomAttribute.value > 0 ? '+' : '-'} ${Math.abs(randomAttribute.value)}`
  const value = scene.add.text(0, 0, valueText, {
    fontSize: setting.fontSize
  })
  value.setOrigin(0.5, 0.5)

  imageContainer.add(property)
  descriptionContainer.add(value)

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    const _player = _.omit(_.clone(player), 'phaserObject')
    _player.attributes[randomAttribute.property] += randomAttribute.value
    socketMethods.clientsInScene('all-scene', methods, 'rebuildPlayer', _player)
    scene.scene.stop()
  }, scene)
}
