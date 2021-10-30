import skins from '../../../skins/index'
import setting from '../../../../../share/setting.json'

export const createRandomSkinCard = (scene, emptyCard, methods) => {
  const {
    itemCell,
    imageContainer,
    descriptionContainer
  } = emptyCard

  const availableSkins = Object.keys(skins).filter(key => key !== 'skull')
  const randomSkin = availableSkins[Math.floor(Math.random() * availableSkins.length)] || availableSkins[0]

  const sprite = scene.add.sprite(0, 0, skins[randomSkin].spritesheetConfig.spritesheetKey)

  if (skins[randomSkin].animsConfig?.idle?.key) {
    sprite.play(skins[randomSkin].animsConfig?.idle?.key)
  }

  const text = scene.add.text(0, 0, randomSkin, {
    fontSize: setting.fontSize
  })
  text.setOrigin(0.5, 0.5)

  imageContainer.add(sprite)
  descriptionContainer.add(text)

  itemCell.on('pointerdown', () => {
    // on choose card
  }, scene)
}
