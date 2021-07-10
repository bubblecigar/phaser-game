import _ from 'lodash'
import itemCellUrl from '../../statics/item_cell.png'
import charactor from '../charactor';
import { gameMethods, gameConfig, gameState, Player, PlayerItem, Item } from '../../../share/game'

let data

function init(_data) {
  data = _data
}

function preload() {
  this.load.image('item_cell', itemCellUrl)
}



function create() {
  const player = data.player
  const items: Item[] = []

  const addItemCell = (x, y, i) => {
    const itemCell = this.add.image(x, y, 'item_cell')
    itemCell.setX(itemCell.x + (itemCell.width - 1) * i)
    itemCell.angle = 90 * (i + 1)
    const text = this.add.text(itemCell.x + 3, y + 3, i + 1, { fontSize: 8 })
    text.setOrigin(0, 0)
    return itemCell
  }
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - 32, 0)
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - 32, 1)
  addItemCell(gameConfig.canvasWidth / 2 - 16, gameConfig.canvasHeight - 32, 2)

}

function update(t, dt) {


}

export default {
  key: 'GUI',
  init,
  preload,
  create,
  update
}