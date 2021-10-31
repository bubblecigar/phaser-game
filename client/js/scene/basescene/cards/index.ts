import gameConfig from '../../../game/config'
import itemCellUrl from '../../../../statics/tile/gui/floor_1.png'
import { drawSkinCard } from './skinCards'
import { drawItemCard } from './itemCard'
import { drawActionCard } from './actionCard'
import { drawAttributeCard } from './attributeCard'
import { Card } from './level'
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

let levelUpText

const drawCard = (scene, emptyCard, options: Card) => {
  switch (options.type) {
    case 'skin': {
      drawSkinCard(scene, emptyCard, methods)(options.value)
      break
    }
    case 'item': {
      drawItemCard(scene, emptyCard, methods)(options.value)
      break
    }
    case 'action': {
      drawActionCard(scene, emptyCard, methods)(options.value)
      break
    }
    case 'attribute': {
      drawAttributeCard(scene, emptyCard, methods)(options.value)
      break
    }
    // case 'resurrect;': {
    //   drawResurrectCard(scene,  emptyCard, methods)(options.value)
    //   break
    // }
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

  drawCard(this, emptyCard1, cards[0])
  drawCard(this, emptyCard2, cards[1])
  drawCard(this, emptyCard3, cards[2])

  levelUpText = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 'level up', {
    fontSize: setting.fontSize
  })
  this.sound.play('collect')
  levelUpText.setOrigin(0.5, 0.5)
  this.time.delayedCall(150, () => {
    levelUpText && levelUpText.destroy()
  }, null, this)
}

function update(t, dt) {
  if (levelUpText) {
    levelUpText.y -= dt / 5
  }
}

export default {
  key: 'cards',
  init,
  preload,
  create,
  update
}