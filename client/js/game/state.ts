import setting from '../../../share/setting.json'
import { GameState } from '../Interface'

const gameState: GameState = {
  players: [],
  items: [],
  monstersById: {},
  winners: null,
  gameStatus: 'waiting',
  scene: 'loginScene',
  gameStartCountDown: setting.gameStartCountDown
}

const initGameState = () => {
  gameState.players = []
  gameState.items = []
  gameState.monstersById = {}
  gameState.winners = null
  gameState.gameStatus = 'waiting'
  gameState.scene = 'loginScene'
  gameState.gameStartCountDown = setting.gameStartCountDown
}

export default gameState
export { initGameState }