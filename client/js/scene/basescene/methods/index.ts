import _ from 'lodash'
import Phaser from 'phaser'
import setting from '../../../../../share/setting.json'
import charactors from '../../../charactors'
import { getLocalUserData } from '../../../user'
import { Player, Item, Monster } from '../../../Interface'
import gameState from '../../../game/state'
import gameConfig from '../../../game/config'
import { shoot } from '../shoot/index'
import { createCharactor, setInvincible, updatePlayerHealthBar, playShootAnimation } from './charactor'
import { createItemMatter } from './item'
import collisionCategories from '../collisionCategories'
import items from '../../../items'

const userId = getLocalUserData().userId

const gameMethods = scene => {
  const methods = {
    getPlayer: (id: string): Player => gameState.players.find(p => p.id === id),
    createPlayer: (player: Player) => {
      const isInState = methods.getPlayer(player.id)
      if (!isInState) {
        gameState.players.push(player)
      }

      const comeFromOtherScene = player.scene !== scene.scene.key
      if (comeFromOtherScene) {
        const spawnPoint = methods.getSpawnPoint()
        player.position = spawnPoint
        player.coins = 0
        player.ready = false
      }
      player.phaserObject = createCharactor(scene, player)

      if (player.id === userId) {
        const camera = scene.cameras.main
        camera.startFollow(player.phaserObject, true, 0.5, 0.5)
        const vision = charactors[player.charactorKey].vision || 100
        const circle = new Phaser.GameObjects.Graphics(scene).fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, vision)
        const mask = new Phaser.Display.Masks.GeometryMask(scene, circle)
        camera.setMask(mask)
      }

      if (player.health === 0) {
        methods.onDead(player.id)
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
    createPlayers: () => {
      gameState.players.forEach(
        player => {
          methods.createPlayer(player)
        }
      )
    },
    createItems: () => {
      gameState.items.forEach(
        item => {
          item.phaserObject = createItemMatter(scene, item)
          item.phaserObject.setData(item)
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
    rebuildPlayer: (playerConstructor: Player): void => {
      methods.removePlayer(playerConstructor.id)
      methods.createPlayer(playerConstructor)
    },
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
    writeMonster: (_monster: Monster) => {
      const monster = methods.getMonster(_monster.id)
      if (!monster || !monster.phaserObject || !monster.phaserObject.body) {
        console.log('monster not initialized')
        return
      }
      Object.keys(_monster).forEach(
        key => {
          monster[key] = _monster[key]
        }
      )

      const sprite = monster.phaserObject.getByName('charactor-sprite')
      const dx = monster.position.x - monster.phaserObject.x
      if (Math.abs(dx) < 5) {
        monster.phaserObject.setVelocityX(0)
      } else if (monster.position.x > monster.phaserObject.x) {
        monster.phaserObject.setVelocityX(1)
        sprite.setFlipX(false)
      } else {
        monster.phaserObject.setVelocityX(-1)
        sprite.setFlipX(true)
      }
    },
    updatePlayerAnimation: (playerId: string, animation: 'idle' | 'move') => {
      const player = methods.getPlayer(playerId)
      if (!player || !player.phaserObject || !player.phaserObject.body) {
        console.log('player not initialized')
        return
      }
      const sprite = player.phaserObject.getByName('charactor-sprite')
      sprite.play(charactors[player.charactorKey].animsConfig[animation].key)
    },
    updatePlayerDirection: (playerId: string, direction: 'left' | 'right') => {
      const player = methods.getPlayer(playerId)
      if (!player || !player.phaserObject || !player.phaserObject.body) {
        console.log('player not initialized')
        return
      }
      const sprite = player.phaserObject.getByName('charactor-sprite')
      sprite.setFlipX(direction === 'right' ? false : true)
    },
    getItem: (id: string): Item => gameState.items.find(p => p.id === id),
    shoot: ({ from, to, builderId, type, options }) => {
      const shooter = methods.getPlayer(builderId) || methods.getMonster(builderId)
      if (shooter) {
        shoot({ scene, to, builderId, type, options, shooter })
        playShootAnimation(shooter)
      }
    },
    resurrect: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const playerConstructor = {
        ...player,
        health: charactors[player.charactorKey].maxHealth,
        resurrectCountDown: setting.resurrectCountDown
      }
      methods.rebuildPlayer(playerConstructor)
    },
    onDead: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const skull = charactors.skull
      const sprite = player.phaserObject.getByName('charactor-sprite')
      const skullSize = charactors["skull"].matterConfig.size
      const playerSize = charactors[player.charactorKey].matterConfig.size
      const widthScale = skullSize.width / playerSize.width
      const heightScale = skullSize.height / playerSize.height
      const sizeFactor = 1 / Math.sqrt(Math.sqrt(widthScale * heightScale))
      Phaser.Physics.Matter.Matter.Body.scale(player.phaserObject.body, sizeFactor * widthScale, sizeFactor * heightScale)
      sprite.setScale(sizeFactor)
      sprite.play(skull.animsConfig.idle.key)
      const halfCoinsCount = Math.floor((player.coins) / 2)
      player.coins = halfCoinsCount
      player.phaserObject.setCollisionCategory(collisionCategories.CATEGORY_TRANSPARENT)
      player.phaserObject.setCollidesWith([collisionCategories.CATEGORY_MAP_BLOCK])

      const healthBar = player.phaserObject.getByName('maximum-bar')
      healthBar.setVisible(false)
    },
    onHit: (playerId: string, damage: number) => {
      const player = methods.getPlayer(playerId)
      if (!player) { return }
      const charactor = charactors[player.charactorKey]
      player.health -= damage
      if (player.health < 0) {
        player.health = 0
      } else if (player.health > charactor.maxHealth) {
        player.health = charactor.maxHealth
      }
      updatePlayerHealthBar(player)
      setInvincible(scene, player)
    },
    onHeal: (playerId: string, heal: number) => {
      const player = methods.getPlayer(playerId)
      if (!player) { return }
      const charactor = charactors[player.charactorKey]
      player.health += heal
      if (player.health > charactor.maxHealth) {
        player.health = charactor.maxHealth
      }
      updatePlayerHealthBar(player)
    },
    addItem: (itemConstructor: Item): Item => {
      const { id, position, itemKey, velocity, builderId } = itemConstructor
      if (!items[itemKey]) {
        return // invalid itemKey
      }
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
        case 'potion': {
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = item.type
          methods.rebuildPlayer(_player)
          methods.onHeal(_player.id, 20)
          break
        }
        default: {
          console.log('unhandled itemKey')
        }
      }
      methods.removeItem(item.id)
    },
    createMonsters: () => {
      Object.keys(gameState.monstersById).forEach(
        id => {
          const monster = gameState.monstersById[id]
          methods.createMonster(monster)
        }
      )
    },
    monsterOnHit: (monsterId: string, damage: number) => {
      const monster = gameState.monstersById[monsterId]
      if (!monster) { return }
      const charactor = charactors[monster.charactorKey]
      monster.health -= damage
      if (monster.health < 0) {
        monster.health = 0
      } else if (monster.health > charactor.maxHealth) {
        monster.health = charactor.maxHealth
      }
      updatePlayerHealthBar(monster)
      setInvincible(scene, monster)
    },
    onMonsterDead: (monsterId: string) => {
      methods.removeMonster(monsterId)
    },
    getMonster: (id: string): Monster => gameState.monstersById[id],
    removeMonster: (id: string) => {
      const monster = gameState.monstersById[id]
      if (!monster) {
        console.log('no such monster')
        return
      }
      monster.phaserObject.destroy()
      delete gameState.monstersById[id]
    },
    createMonster: (monster: Monster) => {
      const isInState = gameState.monstersById[monster.id]
      if (!isInState) {
        gameState.monstersById[monster.id] = monster
      }
      monster.phaserObject = createCharactor(scene, monster)
    }
  }
  return methods
}

export default gameMethods