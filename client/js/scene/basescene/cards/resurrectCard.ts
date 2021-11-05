import setting from '../../../../../share/setting.json'
import { Player } from '../../../Interface'
import { getLocalUserData } from '../../../user'
import _ from 'lodash'
import { socketMethods } from '../../../index'
import skull from '../../../skins/skull'

export const drawResurrectCard = (scene, emptyCard, methods) => () => {
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

  itemCell.on('pointerdown', () => {
    const player: Player = methods.getPlayer(getLocalUserData().userId)
    const _player = _.omit(_.clone(player), 'phaserObject')
    _player.skin = getLocalUserData().activatedSkin
    _player.exp = 0
    _player.level = 0
    _player.action = 'tab'
    _player.item = 'dagger'
    socketMethods.clientsInScene('all-scene', methods, 'rebuildPlayer', _player)
    scene.scene.stop()
  }, scene)

  return itemCell
}
