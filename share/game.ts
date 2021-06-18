import _ from 'lodash'

interface Point {
  x: number,
  y: number
}
interface Velocity {
  x: number,
  y: number
}
interface Player {
  id: string,
  position: Point,
  velocity: Velocity,
  icon: string,
  phaserObject: any
}
interface GameState {
  scene: null | any,
  players: Player[]
}
const gameState: GameState = {
  scene: null,
  players: []
}

const gameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  playerVelocity: 300
}

const gameMethods = (env: 'client' | 'server') => {
  const methods = {
    syncPlayers: (_players: Player[]) => {
      const missingPlayers = _.differenceBy(_players, gameState.players, 'id')
      const ghostPlayers = _.differenceBy(gameState.players, _players, 'id')
      missingPlayers.forEach(player => {
        methods.addPlayer(player.position, player.icon, player.id)
      })
      ghostPlayers.forEach(player => {
        methods.removePlayer(player.id)
      })

      gameState.players.forEach(
        player => {
          const index = _players.findIndex(p => p.id === player.id)
          const _player = _players[index]
          player = { ...player, ..._.omit(_player, 'phaserObject') }

          if (env === 'client') {
            player.phaserObject.setX(player.position.x)
            player.phaserObject.setY(player.position.y)
            player.phaserObject.setVelocityX(player.velocity.x)
            player.phaserObject.setVelocityY(player.velocity.y)
          }
        }
      )
    },
    addPlayer: (p: Point, icon: string, id: string): void => {
      const playerAlreadyExist = gameState.players.some(player => player.id === id)
      if (playerAlreadyExist) {
        console.log('player already exist')
        return
      }

      const player: Player = {
        id,
        icon,
        phaserObject: null,
        position: p,
        velocity: { x: 0, y: 0 }
      }
      gameState.players.push(player)

      if (env === 'client') {
        const scene = gameState.scene
        if (!scene) {
          console.log('not initialize')
          return
        }
        const phaserObject = scene.physics.add.image(p.x, p.y, icon)
        phaserObject.setDepth(3)
        phaserObject.setCollideWorldBounds(true)
        player.phaserObject = phaserObject
      }
    },
    removePlayer: (id: string) => {
      const playerIndex = gameState.players.findIndex(player => player.id === id)
      const player = gameState.players[playerIndex]
      if (!player) {
        console.log('no such player')
        return
      }
      gameState.players = gameState.players.filter(player => player.id !== id)

      if (env === 'client') {
        player.phaserObject.destroy()
      }
    },
    setPlayer: (id: string, data: { position?: Point, velocity?: Velocity }): void => {
      const playerIndex = gameState.players.findIndex(player => player.id === id)
      const player = gameState.players[playerIndex]
      if (!player) return

      if (data.position) {
        player.position = data.position
        player.phaserObject.setX(data.position.x)
        player.phaserObject.setY(data.position.y)
      }
      if (data.velocity) {
        player.velocity = data.velocity
        player.phaserObject.setVelocityX(player.velocity.x)
        player.phaserObject.setVelocityY(player.velocity.y)
      }
    }
  }
  return methods
}

export { gameConfig, gameState, gameMethods }