import gameConfig from '../../../game/config'
import itemCellUrl from '../../../../statics/tile/gui/floor_1.png'
import { drawSkinCard } from './skinCards'
import { drawItemCard } from './itemCard'
import { drawActionCard } from './actionCard'
import { drawAttributeCard } from './attributeCard'
import { drawResurrectCard } from './resurrectCard'
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
    container.setY(position.y - 10)
  })
  itemCell.on('pointerout', function (pointer, x, y, event) {
    container.setY(position.y)
  })

  const upperPosition = {
    x: 0, y: - size.height / 4 + size.padding
  }
  const lowerPosition = {
    x: 0, y: + size.height / 4 - size.padding
  }

  const imageContainer = scene.add.container(upperPosition.x, upperPosition.y)
  const descriptionContainer = scene.add.container(lowerPosition.x, lowerPosition.y)

  const keyHint = scene.add.text(0, size.height * 0.625, `(${n})`, {
    fontSize: setting.fontSize
  })
  keyHint.setOrigin(0.5, 0.5)

  container.add([itemCell, imageContainer, descriptionContainer, keyHint])

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
      return drawSkinCard(scene, emptyCard, methods)(options.value)
    }
    case 'item': {
      return drawItemCard(scene, emptyCard, methods)(options.value)
    }
    case 'action': {
      return drawActionCard(scene, emptyCard, methods)(options.value)
    }
    case 'attribute': {
      return drawAttributeCard(scene, emptyCard, methods)(options.value)
    }
    case 'resurrect': {
      return drawResurrectCard(scene, emptyCard, methods)()
    }
  }
}

function create() {
  const center = { x: gameConfig.canvasWidth / 2, y: gameConfig.canvasHeight / 2 }

  const cardSize = { width: 90, height: 70, padding: 3 }

  const emptyCard1 = createEmptyCard(this, {
    x: center.x - cardSize.width * 1.2,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize, 1)
  const emptyCard2 = createEmptyCard(this, {
    x: center.x,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize, 2)
  const emptyCard3 = createEmptyCard(this, {
    x: center.x + cardSize.width * 1.2,
    y: gameConfig.canvasHeight - cardSize.height
  }, cardSize, 3)

  const card1 = drawCard(this, emptyCard1, cards[0])
  const card2 = drawCard(this, emptyCard2, cards[1])
  const card3 = drawCard(this, emptyCard3, cards[2])

  levelUpText = this.add.text(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 'level up', {
    fontSize: setting.fontSize
  })
  this.sound.play('collect')
  levelUpText.setOrigin(0.5, 0.5)
  this.time.delayedCall(150, () => {
    levelUpText && levelUpText.destroy()
  }, null, this)

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