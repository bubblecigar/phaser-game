import _ from 'lodash'

export interface Point {
  x: number,
  y: number
}
export interface Player {
  interface: 'Player',
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
  interface: 'Item',
  id: string,
  key: string,
  position: Point,
  icon: string,
  phaserObject: any
}
export interface PlayerItem extends Omit<Item, 'interface'> {
  interface: 'PlayerItem',
  builderId: string,
  type: string
}
export interface GameState {
  mapConfigKey: String,
  players: Player[],
  items: PlayerItem[]
}
const gameState: GameState = {
  mapConfigKey: '',
  players: [],
  items: []
}

const gameConfig = {
  canvasWidth: 400,
  canvasHeight: 300
}

const createPlayerMatter = (variables, player: Player) => {
  const { scene, charactors } = variables
  const charactor = charactors[player.charactorKey]
  const { size, origin } = charactor.matterConfig
  const { x, y } = player.position
  const Bodies = variables.Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(x, y, size.width, size.height)
  const sensor = Bodies.circle(x, y, 1, { isSensor: true, label: 'body-sensor' })
  const compound = variables.Phaser.Physics.Matter.Matter.Body.create({
    parts: [sensor, rect],
    inertia: Infinity
  })

  const phaserObject = scene.matter.add.sprite(x, y, undefined, undefined, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
  })
  phaserObject.setExistingBody(compound)
  phaserObject.setOrigin(origin.x, origin.y)
  phaserObject.setCollisionGroup(-1)
  phaserObject.play(charactor.animsConfig.idle.key)
  phaserObject.setDepth(3)
  phaserObject.setData(player)

  return phaserObject
}

const gameMethods = (env: 'client' | 'server') => variables => {
  const methods = {
    init: () => {
      gameState.players = []
      gameState.items = []
    },
    emitGameStateFromServer: (gameState: GameState) => {
      methods.syncPlayers(gameState.players)
      methods.syncItems(gameState.items)
    },
    syncMap: (mapConfigKey: String) => {
      gameState.mapConfigKey = mapConfigKey
      if (env === 'client') {
        methods.init()
        variables.scene.scene.restart({ mapConfigKey })
      }
    },
    syncPlayers: (players: Player[]) => {
      if (env === 'client') {
        gameState.players.forEach(
          player => {
            methods.removePlayer(player.id)
          }
        )
        gameState.players = []
        players.forEach(
          player => {
            methods.addPlayer(player)
          }
        )
      }
    },
    syncItems: (items: PlayerItem[]) => {
      if (env === 'client') {
        gameState.items.forEach(
          item => {
            methods.removeItem(item.id)
          }
        )
        gameState.items = []
        items.forEach(
          item => {
            methods.addItem(item)
          }
        )
      }
    },
    setPlayer: (playerConstructor: Player): void => {
      methods.removePlayer(playerConstructor.id)
      methods.addPlayer(playerConstructor)
    },
    addPlayer: (playerConstructor: Player): void => {
      const { position, velocity, charactorKey, id } = playerConstructor
      const playerAlreadyExist = gameState.players.some(player => player.id === id)
      if (playerAlreadyExist) {
        console.log('player already exist')
        return
      }
      const player: Player = {
        interface: 'Player',
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
        player.phaserObject = createPlayerMatter(variables, player)

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
    movePlayer: (_player: Player): void => {
      const player = methods.getPlayer(_player.id)
      if (!player) {
        return
      }
      const changeDirection = !(
        _player.velocity.x === player.velocity.x
        && _player.velocity.y === player.velocity.y
      )
      player.position = _player.position
      player.velocity = _player.velocity

      if (env === 'client') {
        player.phaserObject.setVelocityX(player.velocity.x)
        player.phaserObject.setVelocityY(player.velocity.y)
        player.position = { x: player.phaserObject.x, y: player.phaserObject.y }
        player.velocity = { x: player.phaserObject.body.velocity.x, y: player.phaserObject.body.velocity.y }
        if (changeDirection) {
          if (player.velocity.x === 0 && player.velocity.y === 0) {
            player.phaserObject.play(variables.charactors[player.charactorKey].animsConfig.idle.key)
          } else {
            player.phaserObject.play(variables.charactors[player.charactorKey].animsConfig.move.key)
            if (player.velocity.x > 0) {
              player.phaserObject.setFlipX(false)
            } else if (player.velocity.x < 0) {
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
        interface: 'PlayerItem',
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
        item.phaserObject.setData(item)
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