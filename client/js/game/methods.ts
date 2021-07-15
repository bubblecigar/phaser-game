import _ from 'lodash'
import Phaser from 'phaser'
import charactors from '../charactors'
import items from '../items'
import { getLocalUserData } from '../user'
import { GameState, Player, Bullet, Item } from '../Interface'
import gameState from './state'
import gameConfig from './config'

const userId = getLocalUserData().userId

const createPlayerMatter = (scene, player: Player) => {
  const charactor = charactors[player.charactorKey]
  const { size, origin } = charactor.matterConfig
  const { x, y } = player.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(x, y, size.width, size.height, { label: 'player-body' })
  const sensor = Bodies.circle(x, y, 1, { isSensor: true, label: 'body-sensor' })
  const compound = Phaser.Physics.Matter.Matter.Body.create({
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

const createBulletMatter = (scene, bulletConstructor: Bullet) => {
  const bullet = items[bulletConstructor.itemKey]
  const { size, origin } = bullet.matterConfig
  const { x, y } = bulletConstructor.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
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

  if (bulletConstructor.angularVelocity) {
    phaserObject.setAngularVelocity(bulletConstructor.angularVelocity)
  }
  scene.time.delayedCall(
    bulletConstructor.duration,
    () => bulletConstructor.phaserObject.destroy(),
    null,
    scene
  )

  return phaserObject
}

const createItemMatter = (scene, itemConstructor: Item | Bullet) => {
  const item = items[itemConstructor.itemKey]
  const { size, origin } = item.matterConfig
  const { x, y } = itemConstructor.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
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

const gameMethods = scene => {
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
      methods.init()
      scene.scene.restart({ mapConfigKey })
    },
    syncPlayers: (players: Player[]) => {
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
    },
    syncItems: (items: Item[]) => {
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

      if (!scene) {
        console.log('not initialize')
        return
      }
      player.phaserObject = createPlayerMatter(scene, player)

      if (playerConstructor.id === userId) {
        const camera = scene.cameras.main
        camera.startFollow(player.phaserObject, true, 0.5, 0.5)
        const circle = new Phaser.GameObjects.Graphics(scene).fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, 100)
        const mask = new Phaser.Display.Masks.GeometryMask(scene, circle)
        camera.setMask(mask)
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

      player.phaserObject.destroy()
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

      if (!player.phaserObject) {
        console.log('player not initialized')
        return
      }
      player.phaserObject.setVelocityX(player.velocity.x)
      player.phaserObject.setVelocityY(player.velocity.y)
      if (player.id !== userId) {
        player.phaserObject.setX(player.position.x)
        player.phaserObject.setY(player.position.y)
      }
      player.position = { x: player.phaserObject.x, y: player.phaserObject.y }
      player.velocity = { x: player.phaserObject.body.velocity.x, y: player.phaserObject.body.velocity.y }
      if (changeDirection) {
        if (player.velocity.x === 0 && player.velocity.y === 0) {
          player.phaserObject.play(charactors[player.charactorKey].animsConfig.idle.key)
        } else {
          player.phaserObject.play(charactors[player.charactorKey].animsConfig.move.key)
          if (player.velocity.x > 0) {
            player.phaserObject.setFlipX(false)
          } else if (player.velocity.x < 0) {
            player.phaserObject.setFlipX(true)
          }
        }
      }
    },
    getItem: (id: string): Item => gameState.items.find(p => p.id === id),
    shootInClient: (bulletConstructors: Bullet[]) => {
      if (!scene) {
        console.log('not initialize')
        return
      }
      bulletConstructors.forEach(
        bulletConstructor => {
          bulletConstructor.phaserObject = createBulletMatter(scene, bulletConstructor)
        }
      )
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

      if (!scene) {
        console.log('not initialize')
        return
      }

      const phaserObject = createItemMatter(scene, itemConstructor)
      item.phaserObject = phaserObject
      item.phaserObject.setData(item)
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

      item.phaserObject.destroy()
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

export default gameMethods