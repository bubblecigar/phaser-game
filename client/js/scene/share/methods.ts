import _ from 'lodash'
import Phaser from 'phaser'
import setting from '../../../../share/setting.json'
import charactors from '../../charactors'
import items from '../../items'
import { getLocalUserData } from '../../user'
import { Player, Bullet, Item, GameState, Monster, Point } from '../../Interface'
import gameState from '../../game/state'
import gameConfig from '../../game/config'
import { shoot } from './shoot'

const userId = getLocalUserData().userId

const createPlayerMatter = (scene, player: Player) => {
  const charactor = charactors[player.charactorKey]
  const { size, origin } = charactor.matterConfig
  const { x, y } = player.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(x, y, size.width, size.height, { label: 'player-body' })
  // const sensor = Bodies.circle(x, y, 1, { isSensor: true, label: 'body-sensor' })
  const compound = Phaser.Physics.Matter.Matter.Body.create({
    parts: [rect],
    inertia: Infinity,
    ignoreGravity: player.id === getLocalUserData().userId ? false : true
  })

  const charatorHeight = charactor.spritesheetConfig.options.frameHeight

  const healthBarLength = 20
  const maximumBar = scene.add.rectangle(-healthBarLength / 2, -charatorHeight / 2 - 2, healthBarLength, 4, 0xDDDDDD)
  maximumBar.setOrigin(0, 0.5)
  maximumBar.name = 'maximum-bar'
  const healthBar = scene.add.rectangle(-healthBarLength / 2 + 1, -charatorHeight / 2 - 2, healthBarLength - 2, 2, 0xda4e38)
  healthBar.setOrigin(0, 0.5)
  healthBar.name = 'health-bar'

  const maximumHealth = charactors[player.charactorKey].maxHealth
  const percentage = player.health / maximumHealth
  healthBar.setSize(percentage * (healthBarLength - 2), healthBar.height)

  const sprite = scene.add.sprite(0, 0)
  sprite.setOrigin(origin.x, origin.y)
  sprite.play(charactor.animsConfig.idle.key)
  sprite.name = 'player-sprite'

  const container = scene.add.container(x, y, [sprite, maximumBar, healthBar])

  const phaserObject = scene.matter.add.gameObject(container, {
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
  })
  phaserObject.setExistingBody(compound)
  phaserObject.setCollisionGroup(-1)
  phaserObject.setDepth(3)
  phaserObject.setData(player)

  if (player.health <= 0) {
    phaserObject.setCollidesWith(-10)
    phaserObject.setIgnoreGravity(true)
  }

  return phaserObject
}

const createItemMatter = (scene, itemConstructor: Item | Bullet) => {
  const item = items[itemConstructor.itemKey]
  const { size, origin } = item.matterConfig
  const { x, y } = itemConstructor.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  let body
  const options = {
    ignoreGravity: true
  }
  if (item.matterConfig.type === 'circle') {
    body = Bodies.circle(x, y, size.radius, options)
  } else if (item.matterConfig.type === 'rectangle') {
    body = Bodies.rectangle(x, y, size.width, size.height, options)
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
  const degree = 180 * angle / Math.PI
  phaserObject.setAngle(degree)

  return phaserObject
}

const gameMethods = scene => {
  const methods = {
    init: () => {
      gameState.players = []
      gameState.items = []
    },
    syncServerStateToClient: (serverGameState: GameState) => {
      methods.syncPlayers(serverGameState.players)
      methods.syncItems(serverGameState.items)
    },
    syncPlayers: (players: Player[]) => {
      gameState.players.forEach(
        player => {
          methods.removePlayer(player.id)
        }
      )
      gameState.players = []
      const spawnPoint = methods.getSpawnPoint()
      players.forEach(
        player => {
          const comeFromOtherScene = player.scene !== scene.scene.key
          if (comeFromOtherScene) {
            player.position = spawnPoint
            player.coins = 0
            player.ready = false
            player.charactorKey = setting.initCharactor
            player.health = setting.initHealth
            player.resurrectCountDown = setting.resurrectCountDown
          }
          methods.addPlayer(player)
        }
      )
    },
    getSpawnPoint: () => {
      const map = scene.map
      const infoLayer = map.objects.find(layer => layer.name === 'info_layer')
      const spawnPoint = infoLayer.objects.find(o => o.name === 'spawn_point')
      return spawnPoint
    },
    changeReadyState: (ready: boolean) => {
      const player = methods.getPlayer(userId)
      player.ready = ready
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
    levelUpPlayer: (player: Player, key: 'damage' | 'duration' | 'speed' | 'consective' | 'rotation' | 'directions') => {
      const abilities = player.abilities

      switch (key) {
        case 'damage': {
          abilities.damageMultiplier += 0.1
          break
        }
        case 'duration': {
          abilities.durationMultiplier += 0.1
          break
        }
        case 'speed': {
          abilities.speedMultiplier += 0.1
          break
        }
        case 'rotation': {
          abilities.rotation = true
          break
        }
        case 'consective': {
          abilities.consectiveShooting++
          break
        }
        case 'directions': {
          const nth = (abilities.directions.length + 1) / 2
          const nthAngle = nth * Math.PI / 4
          abilities.directions.push(nthAngle, -nthAngle)
          break
        }
        default: {
          console.log('invalid key for levelUpPlayer')
          break
        }
      }
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
    writePlayer: (_player: Player) => {
      const player = methods.getPlayer(_player.id)
      if (!player || !player.phaserObject || !player.phaserObject.body) {
        console.log('player not initialized')
        return
      }
      Object.keys(_player).forEach(
        key => {
          player[key] = _player[key]
        }
      )

      if (_player.id !== userId) {
        player.phaserObject.setX(player.position.x)
        player.phaserObject.setY(player.position.y)
      }
    },
    updatePlayerAnimation: (playerId: string, animation: 'idle' | 'move') => {
      const player = methods.getPlayer(playerId)
      if (!player || !player.phaserObject || !player.phaserObject.body) {
        console.log('player not initialized')
        return
      }
      const sprite = player.phaserObject.getByName('player-sprite')
      sprite.play(charactors[player.charactorKey].animsConfig[animation].key)
    },
    updatePlayerDirection: (playerId: string, direction: 'left' | 'right') => {
      const player = methods.getPlayer(playerId)
      if (!player || !player.phaserObject || !player.phaserObject.body) {
        console.log('player not initialized')
        return
      }
      const sprite = player.phaserObject.getByName('player-sprite')
      sprite.setFlipX(direction === 'right' ? false : true)
    },
    getItem: (id: string): Item => gameState.items.find(p => p.id === id),
    shoot: ({ from, to, builderId }) => shoot(scene)({ from, to, builderId }),
    updatePlayerHealthBar: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const maximumHealth = charactors[player.charactorKey].maxHealth
      const maxBar = player.phaserObject.getByName('maximum-bar')
      const percentage = player.health / maximumHealth
      const healthBar = player.phaserObject.getByName('health-bar')
      healthBar.setSize(percentage * (maxBar.width - 2), healthBar.height)
    },
    resurrect: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const playerConstructor = {
        ...player,
        charactorKey: setting.resurrectCharactor,
        health: charactors[setting.resurrectCharactor].maxHealth,
        resurrectCountDown: setting.resurrectCountDown
      }
      methods.setPlayer(playerConstructor)
    },
    onDead: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const halfCoinsCount = Math.floor((player.coins) / 2)
      const ghostCharactor: Player = {
        ...player,
        charactorKey: 'skull',
        velocity: { x: 0, y: 0 },
        health: 0,
        coins: halfCoinsCount,
        resurrectCountDown: setting.resurrectCountDown,
        phaserObject: null
      }
      methods.setPlayer(ghostCharactor)
    },
    onHit: (playerId: string, bullet: Bullet) => {
      const player = methods.getPlayer(playerId)
      player.health -= bullet.damage
      if (player.health < 0) {
        player.health = 0
      }
      methods.updatePlayerHealthBar(playerId)
    },
    addItem: (itemConstructor: Item): Item => {
      const { id, position, itemKey, velocity, builderId } = itemConstructor
      const item: Item = {
        interface: 'Item',
        builderId,
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
    createMonster: (monsterConstructor: Monster) => {
      const charactor = charactors[monsterConstructor.charactorKey]
      const { size, origin } = charactor.matterConfig
      const { x, y } = monsterConstructor.position
      const Bodies = Phaser.Physics.Matter.Matter.Bodies
      const rect = Bodies.rectangle(x, y, size.width, size.height, { label: 'monster-body' })
      const compound = Phaser.Physics.Matter.Matter.Body.create({
        parts: [rect],
        inertia: Infinity,
        isStatic: true
      })

      const charatorHeight = charactor.spritesheetConfig.options.frameHeight

      const healthBarLength = 20
      const maximumBar = scene.add.rectangle(-healthBarLength / 2, -charatorHeight / 2 - 2, healthBarLength, 4, 0xDDDDDD)
      maximumBar.setOrigin(0, 0.5)
      maximumBar.name = 'maximum-bar'
      const healthBar = scene.add.rectangle(-healthBarLength / 2 + 1, -charatorHeight / 2 - 2, healthBarLength - 2, 2, 0xda4e38)
      healthBar.setOrigin(0, 0.5)
      healthBar.name = 'health-bar'

      const maximumHealth = charactor.maxHealth
      const percentage = monsterConstructor.health / maximumHealth
      healthBar.setSize(percentage * (healthBarLength - 2), healthBar.height)

      const sprite = scene.add.sprite(0, 0)
      sprite.setOrigin(origin.x, origin.y)
      sprite.play(charactor.animsConfig.idle.key)
      sprite.name = 'monster-sprite'

      const container = scene.add.container(x, y, [sprite, maximumBar, healthBar])

      const phaserObject = scene.matter.add.gameObject(container, {
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
      })
      phaserObject.setExistingBody(compound)
      phaserObject.setDepth(3)
      phaserObject.setData(monsterConstructor)

      return phaserObject
    }
  }
  return methods
}

export default gameMethods