import setting from '../../../share/setting.json'
import { GameState } from '../Interface'

const gameState: GameState = {
  players: [],
  items: [],
  winner: null,
  gameStatus: 'waiting',
  scene: 'loginScene',
  gameStartCountDown: setting.gameStartCountDown
}

const initGameState = () => {
  gameState.players = []
  gameState.items = []
  gameState.winner = null
  gameState.gameStatus = 'waiting'
  gameState.scene = 'loginScene'
  gameState.gameStartCountDown = setting.gameStartCountDown
}

export default gameState
export { initGameState }