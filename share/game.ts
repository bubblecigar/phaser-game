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
  items: Item[],
  coins: number
}
export interface Monster extends Player {

}
export interface Item {
  interface: 'Item',
  id: string,
  itemKey: string,
  position: Point,
  velocity: Point,
  phaserObject: any
}
export interface Bullet extends Omit<Item, 'interface'> {
  interface: 'Bullet',
  damage: number
}
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
  const rect = Bodies.rectangle(x, y, size.width, size.height, { label: 'player-body' })
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

const createBulletMatter = (variables, bulletConstructor: Bullet) => {
  const { scene, items } = variables
  const bullet = items[bulletConstructor.itemKey]
  const { size, origin } = bullet.matterConfig
  const { x, y } = bulletConstructor.position
  const Bodies = variables.Phaser.Physics.Matter.Matter.Bodies
  let body
  if (bullet.matterConfig.type === 'circle') {
    body = Bodies.circle(x, y, size.radius)
  } else if (bullet.matterConfig.type === 'rectangle') {
    body = Bodies.rectangle(x, y, size.width, size.height)
  } else {
    return // creation fail
  }

  const phaserObject = scene.matter.add.sprite(x, y, bullet.spritesheetConfig.spritesheetKey)
  phaserObject.setExistingBody(body)
  bullet.animsConfig.idle && phaserObject.play(bullet.animsConfig.idle.key)
  phaserObject.setOrigin(origin.x, origin.y)
  phaserObject.setSensor(true)
  phaserObject.setData({ ...bulletConstructor, phaserObject })
  phaserObject.setVelocityX(bulletConstructor.velocity.x)
  phaserObject.setVelocityY(bulletConstructor.velocity.y)
  const angle = Math.atan2(bulletConstructor.velocity.y, bulletConstructor.velocity.x)
  const degree = 90 + 180 * angle / Math.PI
  phaserObject.setAngle(degree)

  if (bullet.angularVelocity) {
    phaserObject.setAngularVelocity(bullet.angularVelocity)
  }
  setTimeout(
    () => bulletConstructor.phaserObject.destroy()
    , bullet.duration || 1000
  )

  return phaserObject
}

const createItemMatter = (variables, itemConstructor: Item | Bullet) => {
  const { scene, items } = variables
  const item = items[itemConstructor.itemKey]
  const { size, origin } = item.matterConfig
  const { x, y } = itemConstructor.position
  const Bodies = variables.Phaser.Physics.Matter.Matter.Bodies
  let body
  if (item.matterConfig.type === 'circle') {
    body = Bodies.circle(x, y, size.radius)
  } else if (item.matterConfig.type === 'rectangle') {
    body = Bodies.rectangle(x, y, size.width, size.height)
  } else {
    return // creation fail
  }

  const phaserObject = scene.matter.add.sprite(x, y, item.spritesheetConfig.spritesheetKey)
  phaserObject.setExistingBody(body)
  item.animsConfig.idle && phaserObject.play(item.animsConfig.idle.key)
  phaserObject.setOrigin(origin.x, origin.y)
  phaserObject.setSensor(true)
  phaserObject.setData(itemConstructor)
  phaserObject.setVelocityX(itemConstructor.velocity.x)
  phaserObject.setVelocityY(itemConstructor.velocity.y)
  const angle = Math.atan2(itemConstructor.velocity.y, itemConstructor.velocity.x)
  const degree = 90 + 180 * angle / Math.PI
  phaserObject.setAngle(degree)

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
    syncItems: (items: Item[]) => {
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
      const playerAlreadyExist = gameState.players.some(player => player.id === playerConstructor.id)
      if (playerAlreadyExist) {
        console.log('player already exist')
        return
      }
      const player: Player = playerConstructor
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
        if (!player.phaserObject) {
          console.log('player not initialized')
          return
        }
        player.phaserObject.setVelocityX(player.velocity.x)
        player.phaserObject.setVelocityY(player.velocity.y)
        if (player.id !== variables.userId) {
          player.phaserObject.setX(player.position.x)
          player.phaserObject.setY(player.position.y)
        }
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
    getItem: (id: string): Item => gameState.items.find(p => p.id === id),
    shootInClient: (bulletConstructor: Bullet) => {
      if (env === 'client') {
        const scene = variables.scene
        if (!scene) {
          console.log('not initialize')
          return
        }

        bulletConstructor.phaserObject = createBulletMatter(variables, bulletConstructor)
      }
    },
    onHit: (playerId: string, bullet: Bullet) => {
      const player = methods.getPlayer(playerId)
      player.health -= bullet.damage
      if (player.health <= 0) {
        player.health = 0
        const ghostCharactor: Player = {
          ...player,
          charactorKey: 'skull',
          velocity: { x: 0, y: 0 },
          phaserObject: null,
          health: 0,
          items: [],
          coins: 0
        }
        methods.setPlayer(ghostCharactor)
      }
    },
    addItem: (itemConstructor: Item): Item => {
      const { id, position, itemKey, velocity } = itemConstructor
      const item: Item = {
        interface: 'Item',
        id,
        position,
        itemKey,
        velocity,
        phaserObject: null
      }
      gameState.items.push(item)

      if (env === 'client') {
        const scene = variables.scene
        if (!scene) {
          console.log('not initialize')
          return
        }

        const phaserObject = createItemMatter(variables, itemConstructor)
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
    collectItem: (playerId: string, item: Item) => {
      const player = methods.getPlayer(playerId)
      if (!player) {
        console.log('no player for collectItem')
        return
      }
      switch (item.itemKey) {
        case 'coin': {
          player.coins++
          break
        }
        default: {
          console.log('unhandled itemKey')
        }
      }
      methods.removeItem(item.id)
    },
    interact: (player: Player, item: Item, action = 'default') => {
      console.log(player)
      console.log(item)
    }
  }
  return methods
}

export { gameConfig, gameState, gameMethods }