import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import bombUrl from '../../statics/bomb.png'
import { gameMethods, gameConfig, gameState, Player, PlayerItem, Item } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactor'
import socket, { registerSocketEvents } from '../socket'
import mapConfigs from './mapConfigs'
import FOV from './FOV'
import registerWorldEvents from './WorldEvents';

interface MapItem extends Item {

}

const userId = getLocalUserData().userId

let methods
let cursors
let mapConfig = mapConfigs['waitingRoomConfig']
let map

function init(data) {
  mapConfig = mapConfigs[data.mapConfigKey] || mapConfig
  methods = gameMethods('client')({ userId, Phaser, charactors, scene: this })
  registerSocketEvents(methods)
  registerWorldEvents(this)
}

function preload() {
  this.load.image('bomb', bombUrl)
  this.load.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  this.load.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)
  Object.keys(charactors).forEach(
    char => {
      charactors[char].preloadAssets(this)
    }
  )
}

const registerInputEvents = scene => {
  cursors = scene.input.keyboard.createCursorKeys()
  scene.input.keyboard.on('keyup', e => {
    switch (e.key) {
      case ' ': {
        const player: Player = methods.getPlayer(getLocalUserData().userId)
        scene.scene.launch('GUI', { player });
        break
      }
      default: {
        // do nothing
      }
    }
  })
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 's': {
          const randomMapConfigKey = Object.keys(mapConfigs)[Math.floor(Math.random() * 10) % (Object.keys(mapConfigs).length)]
          methods.syncMap(randomMapConfigKey)
          socket.emit('syncMap', randomMapConfigKey)
          break
        }
        case 'z': {
          const getNearestReachableItem = (position, items = gameState.items): false | PlayerItem => {
            let reachable = false
            const nearestItem = _.minBy(items, item => {
              const distance = Phaser.Math.Distance.BetweenPoints(item.position, position)
              if (distance < 30) { reachable = true }
              return distance
            })
            return reachable && nearestItem
          }

          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const interactableItem = getNearestReachableItem(player.position)
          if (!interactableItem) return
          socket.emit('removeItem', interactableItem.id)
          methods.removeItem(interactableItem.id)
          break
        }
        case 'x': {
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const itemConstructor: PlayerItem = {
            interface: 'PlayerItem',
            builderId: player.id,
            key: 'player-bomb',
            id: v4(),
            icon: 'bomb',
            type: 'block',
            position: player.position,
            phaserObject: null
          }
          const item: PlayerItem = methods.addItem(itemConstructor)
          socket.emit('addItem', _.omit(item, 'phaserObject'))
          break
        }
        case ' ': {
          scene.scene.stop('GUI')
          break
        }
        default: {
          // do nothing
        }
      }
    }
  )
}

const createPlayer = () => {
  const item_layer = map.objects.find(o => o.name === 'item_layer')
  const spawnPoint = item_layer ? item_layer.objects.find(o => o.name === 'spawn_point') : { x: map.widthInPixels / 2, y: map.heightInPixels / 2 }
  const x = spawnPoint.x
  const y = spawnPoint.y
  const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
  const player = {
    id: userId,
    charactorKey: randomCharactorKey,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    phaserObject: null
  }
  socket.emit('init-player', player)
}

function create() {
  registerInputEvents(this)
  map = FOV.create(this, mapConfig)

  Object.keys(charactors).forEach(
    char => {
      charactors[char].createAnims(this)
    }
  )

  createPlayer()
  const player: Player = methods.getPlayer(getLocalUserData().userId)
  this.scene.launch('GUI', { player })
}

const movePlayer = (player: Player) => {
  const _velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    _velocity.x = -gameConfig.playerVelocity
  } else if (cursors.right.isDown) {
    _velocity.x = gameConfig.playerVelocity
  } else {
    _velocity.x = 0
  }
  if (cursors.up.isDown) {
    _velocity.y = -gameConfig.playerVelocity
  } else if (cursors.down.isDown) {
    _velocity.y = gameConfig.playerVelocity
  } else {
    _velocity.y = 0
  }
  methods.movePlayer(userId, { velocity: _velocity })
  socket.emit('move-player', _.omit(player, 'phaserObject'))
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player || !player.phaserObject) return
  FOV.update(this, player.position)
  movePlayer(player)
}

export default {
  key: 'dungeon',
  init,
  preload,
  create,
  update
}