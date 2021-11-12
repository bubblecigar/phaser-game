import _ from 'lodash'
import Phaser from 'phaser'
import setting from '../../../../../share/setting.json'
import skins from '../../../skins'
import { getLocalUserData } from '../../../user'
import { Player, Item, Monster, Point } from '../../../Interface'
import gameState from '../../../game/state'
import gameConfig from '../../../game/config'
import { createCharactor, setInvincible, updatePlayerHealthBar, playShootAnimation } from './charactor'
import { createItemMatter } from './item'
import collisionCategories from '../collisionCategories'
import items from '../../../items'
import { perform } from '../../../actions'
import skull from '../../../skins/skull'

const gameMethods = scene => {
  const userId = getLocalUserData().userId
  const methods = {
    getPlayer: (id: string): Player => gameState.players.find(p => p.id === id),
    createPlayer: (player: Player) => {
      const isInState = methods.getPlayer(player.id)
      if (!isInState) {
        gameState.players.push(player)
      }

      const comeFromOtherScene = player.scene !== scene.scene.key
      if (comeFromOtherScene) {
        const spawnPoint = methods.getSpawnPoint(player.team)
        player.position = spawnPoint
        player.coins = 0
        player.ready = false
      }
      player.phaserObject = createCharactor(scene, player)

      if (player.id === userId) {
        const camera = scene.cameras.main
        camera.startFollow(player.phaserObject, true, 0.5, 0.5)
        const vision = player.attributes.vision
        scene.visionCircle.fillCircle(gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2, vision)
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
      const txt = scene.add.text(10, 10, gameState.players[0].skin)
      txt.setScrollFactor(0)
      txt.setDepth(102)
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
    getSpawnPoint: (team) => {
      const map = scene.map
      const infoLayer = map.objects.find(layer => layer.name === 'info_layer')
      const spawnPoint = infoLayer.objects.find(o => o.name === (team === 'red' ? 'red_team_spawn_point' : 'blue_team_spawn_point'))
      return spawnPoint
    },
    changeReadyState: (ready: boolean, team: 'red' | 'blue') => {
      const player = methods.getPlayer(userId)
      player.ready = ready
      player.team = team
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
    writeMonsters: (monstersById) => {
      const diff = _.difference(Object.keys(gameState.monstersById), Object.keys(monstersById))

      diff.forEach(
        id => {
          if (monstersById[id] && !gameState.monstersById[id]) {
            methods.createMonster(monstersById[id])
          } else if (!monstersById[id] && gameState.monstersById[id]) {
            methods.removeMonster(id)
          }
        }
      )

      Object.keys(monstersById).forEach(
        key => {
          const monster = monstersById[key]
          methods.writeMonster(monster)
        }
      )
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
      const skin = skins[player.skin]
      sprite.play(skin.animsConfig[animation].key)
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
    performAction: ({ performerId, target, action, options }) => {
      const performer = methods.getPlayer(performerId) || methods.getMonster(performerId)
      if (performer) {
        perform(scene, performer, action, target, options)
        playShootAnimation(performer)
      }
    },
    resurrect: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const spawnPoint = methods.getSpawnPoint(player.team)
      const playerConstructor = {
        ...player,
        position: spawnPoint,
        health: player.attributes.maxHealth,
        resurrectCountDown: setting.resurrectCountDown
      }
      methods.rebuildPlayer(playerConstructor)
    },
    onDead: (playerId: string) => {
      const player = methods.getPlayer(playerId)
      const skin = skins[player.skin]
      const skull = skins["skull"]
      const sprite = player.phaserObject.getByName('charactor-sprite')
      const skullSize = skull.matterConfig.size
      const playerSize = skin.matterConfig.size
      const widthScale = skullSize.width / playerSize.width
      const heightScale = skullSize.height / playerSize.height
      const sizeFactor = 1 / Math.sqrt(Math.sqrt(widthScale * heightScale))
      Phaser.Physics.Matter.Matter.Body.scale(player.phaserObject.body, sizeFactor * widthScale, sizeFactor * heightScale)
      sprite.setScale(sizeFactor)
      sprite.play(skull.animsConfig.idle.key)
      player.phaserObject.setCollisionCategory(collisionCategories.CATEGORY_TRANSPARENT)
      player.phaserObject.setCollidesWith([collisionCategories.CATEGORY_MAP_BLOCK])

      const healthBar = player.phaserObject.getByName('maximum-bar')
      healthBar.setVisible(false)
    },
    onHit: (playerId: string, damage: number) => {
      const player = methods.getPlayer(playerId)
      if (!player) { return }
      const maxHealth = player.attributes.maxHealth
      player.health -= damage
      if (player.health < 0) {
        player.health = 0
      } else if (player.health > maxHealth) {
        player.health = maxHealth
      }
      updatePlayerHealthBar(player)
      setInvincible(scene, player)
    },
    onHeal: (playerId: string, heal: number) => {
      const player = methods.getPlayer(playerId)
      if (!player) { return }
      const maxHealth = player.attributes.maxHealth
      player.health += heal
      if (player.health > maxHealth) {
        player.health = maxHealth
      }
      updatePlayerHealthBar(player)
    },
    addItem: (itemConstructor: Item): Item => {
      const { id, position, itemKey, velocity, builderId, isDrop } = itemConstructor
      if (!items[itemKey]) {
        return // invalid itemKey
      }
      const item: Item = {
        interface: 'Item',
        builderId,
        id,
        isDrop,
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
      const maxHealth = monster.attributes.maxHealth
      monster.health -= damage
      if (monster.health < 0) {
        monster.health = 0
      } else if (monster.health > maxHealth) {
        monster.health = maxHealth
      }
      updatePlayerHealthBar(monster)
      setInvincible(scene, monster)
    },
    onMonsterDead: (monsterId: string, deadPosition: Point) => {
      methods.removeMonster(monsterId)

      const deadBody = scene.matter.add.sprite(deadPosition.x, deadPosition.y, skull.spritesheetConfig.spritesheetKey)
      deadBody.setCollisionCategory(collisionCategories.CATEGORY_TRANSPARENT)
      deadBody.applyForce({ x: 0.006 * (Math.random() - 0.5), y: -0.003 })

      scene.time.delayedCall(5000, () => deadBody.destroy(), null, scene)
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