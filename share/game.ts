import _ from 'lodash'

interface Point {
  x: number,
  y: number
}
interface Player {
  id: string,
  velocity: Point,
  position: Point,
  icon: string,
  phaserObject: any
}
interface Item {
  id: string,
  builderId: string,
  position: Point,
  icon: string,
  type: string,
  phaserObject: any
}
interface GameState {
  scene: null | any,
  players: Player[],
  items: Item[]
}
const gameState: GameState = {
  scene: null,
  players: [],
  items: []
}

const gameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  playerVelocity: 300
}

const gameMethods = (env: 'client' | 'server') => variables => {
  const methods = {
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
    syncItems: (_items: Item[]) => {
      const missingItems = _.differenceBy(_items, gameState.items, 'id')
      missingItems.forEach(item => {
        methods.addItem(item)
      })
    },
    addPlayer: (playerConstructor: Player): void => {
      const { position, velocity, icon, id } = playerConstructor
      const playerAlreadyExist = gameState.players.some(player => player.id === id)
      if (playerAlreadyExist) {
        console.log('player already exist')
        return
      }

      const player: Player = {
        id,
        icon,
        position,
        velocity,
        phaserObject: null
      }
      gameState.players.push(player)

      if (env === 'client') {
        const scene = gameState.scene
        if (!scene) {
          console.log('not initialize')
          return
        }
        const phaserObject = scene.physics.add.image(position.x, position.y, icon)
        phaserObject.setDepth(3)
        phaserObject.setCollideWorldBounds(true)
        player.phaserObject = phaserObject

        if (playerConstructor.id === variables.userId) {
          const camera = scene.cameras.cameras[0]
          camera.startFollow(player.phaserObject, false, 0.2, 0.2)
          camera.roundPixels = true
          const Phaser = variables.Phaser
          const circle = new Phaser.GameObjects.Graphics(scene).fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 230)
          const mask = new Phaser.Display.Masks.GeometryMask(scene, circle)
          camera.setMask(mask)
          const wallLayer = scene.children.getByName('wall_layer')
          scene.physics.add.collider(player.phaserObject, wallLayer)
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
        console.log('player not found')
        return
      }
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
      }
    },
    addItem: (itemConstructor: Item): Item => {
      const { builderId, id, icon, type, position } = itemConstructor
      const builder = methods.getPlayer(builderId)
      const item: Item = {
        id,
        builderId,
        position,
        icon,
        type,
        phaserObject: null
      }
      gameState.items.push(item)

      if (env === 'client') {
        const scene = gameState.scene
        if (!scene) {
          console.log('not initialize')
          return
        }
        if (type === 'block') {
          const phaserObject = scene.physics.add.staticImage(position.x, position.y, icon)
          item.phaserObject = phaserObject
          const clientPlayer = methods.getPlayer(variables.userId)
          scene.physics.add.collider(clientPlayer.phaserObject, item.phaserObject)
        }
        if (type === 'ground') {
          const phaserObject = scene.add.image(builder.position.x, builder.position.y, icon)
          item.phaserObject = phaserObject
        }
      }
      return item
    }
  }
  return methods
}

export { gameConfig, gameState, gameMethods }