import _ from 'lodash'

export interface Point {
  x: number,
  y: number
}
export interface Player {
  id: string,
  velocity: Point,
  position: Point,
  charactorKey: string,
  phaserObject: any,
  health: number,
  items: Item[]
}
export interface Monster extends Player {

}
export interface Item {
  id: string,
  key: string,
  position: Point,
  icon: string,
  phaserObject: any
}
export interface PlayerItem extends Item {
  builderId: string,
  type: string
}
export interface GameState {
  players: Player[],
  items: PlayerItem[],
  monsters: Monster[]
}
const gameState: GameState = {
  players: [],
  items: [],
  monsters: []
}

const gameConfig = {
  canvasWidth: 400,
  canvasHeight: 300,
  playerVelocity: 3
}

const gameMethods = (env: 'client' | 'server') => variables => {
  const methods = {
    init: () => {
      gameState.players = []
      gameState.items = []
    },
    syncPlayers: (_players: Player[]) => {
      const missingPlayers = _.differenceBy(_players, gameState.players, 'id')
      missingPlayers.forEach(player => {
        methods.addPlayer(player)
      })

      gameState.players.forEach(
        player => {
          const index = _players.findIndex(p => p.id === player.id)
          const _player = _players[index]
          player = { ...player, ..._.omit(_player, 'phaserObject') }

          if (env === 'client') {
            player.phaserObject.setX(player.position.x)
            player.phaserObject.setY(player.position.y)
          }
        }
      )
    },
    syncItems: (_items: PlayerItem[]) => {
      const missingItems = _.differenceBy(_items, gameState.items, 'id')
      missingItems.forEach(item => {
        methods.addItem(item)
      })
    },
    addPlayer: (playerConstructor: Player): void => {
      const { position, velocity, charactorKey, id } = playerConstructor
      const playerAlreadyExist = gameState.players.some(player => player.id === id)
      if (playerAlreadyExist) {
        console.log('player already exist')
        return
      }
      const player: Player = {
        id,
        charactorKey,
        position,
        velocity,
        health: 100,
        items: [],
        phaserObject: null
      }
      gameState.players.push(player)

      if (env === 'client') {
        const scene = variables.scene
        if (!scene) {
          console.log('not initialize')
          return
        }
        const charactor = variables.charactors[player.charactorKey]
        player.phaserObject = charactor.addToScene(scene, position.x, position.y)

        if (playerConstructor.id === variables.userId) {
          const camera = scene.cameras.main
          camera.startFollow(player.phaserObject, true, 0.5, 0.5)
          const Phaser = variables.Phaser
          const circle = new Phaser.GameObjects.Graphics(scene).fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 100)
          const mask = new Phaser.Display.Masks.GeometryMask(scene, circle)
          camera.setMask(mask)
        }
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
    getPlayer: (id: string): Player => gameState.players.find(p => p.id === id),
    movePlayer: (id: string, data: { velocity?: Point, position?: Point }): void => {
      const player = methods.getPlayer(id)
      if (!player) {
        // console.log('player not found')
        return
      }
      const changeDirection = !(
        data.velocity.x === player.velocity.x
        && data.velocity.y === player.velocity.y
      )
      if (data.position) {
        player.position = data.position
      }
      if (data.velocity) {
        player.velocity = data.velocity
      }
      if (env === 'client') {
        if (data.position) {
          player.phaserObject.setX(player.position.x)
          player.phaserObject.setY(player.position.y)
        }
        if (data.velocity) {
          player.phaserObject.setVelocityX(player.velocity.x)
          player.phaserObject.setVelocityY(player.velocity.y)
        }
        player.position = { x: player.phaserObject.x, y: player.phaserObject.y }
        player.velocity = { x: player.phaserObject.body.velocity.x, y: player.phaserObject.body.velocity.y }
        if (changeDirection) {
          if (player.velocity.x === 0 && player.velocity.y === 0) {
            player.phaserObject.play(variables.charactors[player.charactorKey].animations.idle)
          } else {
            player.phaserObject.play(variables.charactors[player.charactorKey].animations.move)
            if (player.velocity.x >= 0) {
              player.phaserObject.setFlipX(false)
            } else {
              player.phaserObject.setFlipX(true)
            }
          }
        }
      }
    },
    addItem: (itemConstructor: PlayerItem): PlayerItem => {
      const { builderId, id, key, icon, type, position } = itemConstructor
      const builder = methods.getPlayer(builderId)
      const item: PlayerItem = {
        id,
        key,
        builderId,
        position,
        icon,
        type,
        phaserObject: null
      }
      gameState.items.push(item)

      if (env === 'client') {
        const scene = variables.scene
        if (!scene) {
          console.log('not initialize')
          return
        }
        const phaserObject = scene.matter.add.image(position.x, position.y, icon, undefined, { isStatic: true })
        item.phaserObject = phaserObject
      }
      return item
    },
    removeItem: (id: string) => {
      const itemIndex = gameState.items.findIndex(item => item.id === id)
      const item = gameState.items[itemIndex]
      if (!item) {
        console.log('no such item')
        return
      }
      gameState.items = gameState.items.filter(item => item.id !== id)

      if (env === 'client') {
        item.phaserObject.destroy()
      }
    },
    interact: (player: Player, item: Item, action = 'default') => {
      if (item.key === 'player-bomb' && action === 'default') {
        methods.removeItem(item.id)
      }
    }
  }
  return methods
}

export { gameConfig, gameState, gameMethods }