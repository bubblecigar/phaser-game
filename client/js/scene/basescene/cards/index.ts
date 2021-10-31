import gameConfig from '../../../game/config'
import itemCellUrl from '../../../../statics/tile/gui/floor_1.png'
import { drawRandomSkinCard } from './skinCards'
import { drawRandomItemCard } from './itemCard'
import { drawRandomActionCard } from './actionCard'
import { drawRandomAttributeCard } from './attributeCard'

let methods

function init(data) {
  methods = data
}

function preload() {
  this.load.image('itemCell', itemCellUrl)
}

const createEmptyCard = (scene, position, size) => {
  const container = scene.add.container(position.x, position.y)
  const itemCell = scene.add.image(0, 0, 'itemCell')
  const widthScaleFactor = size.width / itemCell.width
  const heightScaleFactor = size.height / itemCell.height
  itemCell.setScale(widthScaleFactor, heightScaleFactor)
  itemCell.setAlpha(0.7)
  itemCell.setInteractive({
    cursor: 'pointer'
  })
  itemCell.on('pointermove', function (pointer, x, y, event) {
    itemCell.setAlpha(1)
  })
  itemCell.on('pointerout', function (pointer, x, y, event) {
    itemCell.setAlpha(0.7)
  })

  const upperPosition = {
    x: 0, y: - size.height / 4 + size.padding
  }
  const lowerPosition = {
    x: 0, y: + size.height / 4 - size.padding
  }

  const imageContainer = scene.add.container(upperPosition.x, upperPosition.y)
  const descriptionContainer = scene.add.container(lowerPosition.x, lowerPosition.y)

  container.add([itemCell, imageContainer, descriptionContainer])

  return {
    itemCell,
    imageContainer,
    descriptionContainer
  }
}

function create() {
  const center = { x: gameConfig.canvasWidth / 2, y: gameConfig.canvasHeight / 2 }

  const cardSize = { width: 90, height: 70, padding: 3 }

  const emptyCard1 = createEmptyCard(this, {
    x: center.x - cardSize.width * 1.2,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize)
  const emptyCard2 = createEmptyCard(this, {
    x: center.x,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize)
  const emptyCard3 = createEmptyCard(this, {
    x: center.x + cardSize.width * 1.2,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize)

  drawRandomSkinCard(this, emptyCard1, methods)
  drawRandomItemCard(this, emptyCard2, methods)
  drawRandomAttributeCard(this, emptyCard3, methods)
}

function update(t, dt) {

}

export default {
  key: 'cards',
  init,
  preload,
  create,
  update
}