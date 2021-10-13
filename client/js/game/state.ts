import setting from '../../../share/setting.json'
import { GameState } from '../Interface'

const gameState: GameState = {
  players: [],
  items: [],
  winner: null,
  gameStatus: 'waiting',
  gameStartCountDown: setting.gameStartCountDown
}

const initGameState = () => {
  gameState.players = []
  gameState.items = []
  gameState.winner = null
  gameState.gameStatus = 'waiting'
  gameState.gameStartCountDown = setting.gameStartCountDown
}

export default gameState
export { initGameState }