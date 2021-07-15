import { Player, Item } from './Interface'

export interface GameState {
  mapConfigKey: String,
  players: Player[],
  items: Item[]
}
const gameState: GameState = {
  mapConfigKey: '',
  players: [],
  items: []
}

export default gameState