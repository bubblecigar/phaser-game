import gameConfig from '../../../game/config'
import itemCellUrl from '../../../../statics/tile/gui/floor_1.png'
import { drawSkinCard } from './skinCards'
import { drawItemCard } from './itemCard'
import { drawActionCard } from './actionCard'
import { drawAttributeCard } from './attributeCard'
import { drawResurrectCard } from './resurrectCard'
import { Card, levelUp } from './level'
import setting from '../../../../../share/setting.json'

let methods
let cards

function init(data) {
  methods = data.methods
  cards = data.cards
}

function preload() {
  this.load.image('itemCell', itemCellUrl)
}

const createEmptyCard = (scene, position, size, n) => {
  const container = scene.add.container(position.x, position.y)
  const itemCell = scene.add.image(0, 0, 'itemCell')
  const widthScaleFactor = size.width / itemCell.width
  const heightScaleFactor = size.height / itemCell.height
  itemCell.setScale(widthScaleFactor, heightScaleFactor)
  itemCell.setInteractive({
    cursor: 'pointer'
  })
  itemCell.on('pointermove', function (pointer, x, y, event) {
    container.setScale(1.1)
  })
  itemCell.on('pointerout', function (pointer, x, y, event) {
    container.setScale(1)
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
    container,
    itemCell,
    imageContainer,
    descriptionContainer
  }
}

const drawCard = (scene, emptyCard, options: Card, onFinished) => {
  let drawFunction
  switch (options.type) {
    case 'skin': {
      drawFunction = drawSkinCard
      break
    }
    case 'item': {
      drawFunction = drawItemCard
      break
    }
    case 'action': {
      drawFunction = drawActionCard
      break
    }
    case 'attribute': {
      drawFunction = drawAttributeCard
      break
    }
    case 'resurrect': {
      drawFunction = drawResurrectCard
      break
    }
    default: {
      drawFunction = () => () => { }
    }
  }
  return drawFunction(scene, emptyCard, methods, onFinished)(options.value)
}

const cardSize = { width: 70, height: 58, padding: 3 }

function create() {
  const center = { x: gameConfig.canvasWidth / 2, y: gameConfig.canvasHeight / 2 }


  this.emptyCard1 = createEmptyCard(this, {
    x: center.x - cardSize.width * 1.2,
    y: -20
  }, cardSize, 1)
  this.emptyCard2 = createEmptyCard(this, {
    x: center.x,
    y: -20
  }, cardSize, 2)
  this.emptyCard3 = createEmptyCard(this, {
    x: center.x + cardSize.width * 1.2,
    y: -20
  }, cardSize, 3)

  const onFinished = () => levelUp(this, methods)

  const card1 = drawCard(this, this.emptyCard1, cards[0], onFinished)
  const card2 = drawCard(this, this.emptyCard2, cards[1], onFinished)
  const card3 = drawCard(this, this.emptyCard3, cards[2], onFinished)


  this.input.keyboard.on('keydown', e => {
    if (e.key === '1') {
      card1.emit('pointerdown')
    } else if (e.key === '2') {
      card2.emit('pointerdown')
    } else if (e.key === '3') {
      card3.emit('pointerdown')
    }
  })
}

function update(t, dt) {
  if (this.emptyCard1.container.y <= gameConfig.canvasHeight * 0.25) {
    this.emptyCard1.container.y += dt / 3
  }
  if (this.emptyCard2.container.y <= gameConfig.canvasHeight * 0.25) {
    this.emptyCard2.container.y += dt / 3
  }
  if (this.emptyCard3.container.y <= gameConfig.canvasHeight * 0.25) {
    this.emptyCard3.container.y += dt / 3
  }
}

export default {
  key: 'cards',
  init,
  preload,
  create,
  update
}