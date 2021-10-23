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
        player.charactorKey = setting.initCharactor
        player.health = setting.initHealth
        player.resurrectCountDown = setting.resurrectCountDown
      }
      player.phaserObject = createCharactor(scene, player)

      if (player.id === userId) {
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
      shoot({ scene, from, to, builderId, type, options })
      const charactor = methods.getPlayer(builderId) || methods.getMonster(builderId)
      if (charactor) {
        playShootAnimation(charactor)
      }
    },
    resurrect: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const playerConstructor = {
        ...player,
        charactorKey: setting.resurrectCharactor,
        health: charactors[setting.resurrectCharactor].maxHealth,
        resurrectCountDown: setting.resurrectCountDown
      }
      methods.rebuildPlayer(playerConstructor)
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
      methods.rebuildPlayer(ghostCharactor)
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
    createMonsters: () => {
      gameState.monsters.forEach(
        monster => {
          methods.createMonster(monster)
        }
      )
    },
    monsterOnHit: (monsterId: string, damage, number) => {
      const monster = methods.getMonster(monsterId)
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
    getMonster: (id: string): Monster => gameState.monsters.find(m => m.id === id),
    removeMonster: (id: string) => {
      const monsterIndex = gameState.monsters.findIndex(monster => monster.id === id)
      const monster = gameState.monsters[monsterIndex]
      if (!monster) {
        console.log('no such monster')
        return
      }
      gameState.monsters = gameState.monsters.filter(monster => monster.id !== id)

      monster.phaserObject.destroy()
    },
    createMonster: (monster: Monster) => {
      const isInState = methods.getMonster(monster.id)
      if (!isInState) {
        gameState.monsters.push(monster)
      }
      monster.phaserObject = createCharactor(scene, monster)
    }
  }
  return methods
}

export default gameMethods