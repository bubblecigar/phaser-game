import { GameState } from '../Interface'

const gameState: GameState = {
  players: [],
  items: [],
  winner: null,
  gameStatus: 'waiting'
}

const initGameState = () => {
  gameState.players = []
  gameState.items = []
  gameState.winner = null
  gameState.gameStatus = 'waiting'
}

export default gameState
export { initGameState }