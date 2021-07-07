import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import bombUrl from '../../statics/bomb.png'
import { gameMethods, gameConfig, gameState, Player, PlayerItem, Item } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactor'
import socket, { registerSocketEvents } from '../socket'
import tilesetUrl from '../../statics/tile/tileset.png'
import dungeonMapUrl from '../../statics/tile/small_map.json'
import roomMapUrl from '../../statics/tile/room_map.json'
import FOV from './FOV'

export interface MapConfig {
  mapKey: string,
  mapUrl: string,
  tilesetKey: string,
  tilesetUrl: string,
  collisionTiles: number[]
}

interface MapItem extends Item {

}


const userId = getLocalUserData().userId

let methods
let cursors
let mapConfig
let mapItems: MapItem[] = []

const dungeonMapConfig: MapConfig = {
  mapKey: 'dungeon',
  mapUrl: dungeonMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl,
  collisionTiles: [17, 18, 19]
}
const roomMapConfig: MapConfig = {
  mapKey: 'room',
  mapUrl: roomMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl,
  collisionTiles: [17, 18, 19]
}

function init(data) {
  mapConfig = data.mapConfig || roomMapConfig
  mapItems = []
  methods = gameMethods('client')({ userId, Phaser, charactors, scene: this })
  registerSocketEvents(methods)
}

function preload() {
  this.load.image('bomb', bombUrl);
  this.load.image(dungeonMapConfig.tilesetKey, dungeonMapConfig.tilesetUrl);
  this.load.tilemapTiledJSON(dungeonMapConfig.mapKey, dungeonMapConfig.mapUrl);
  this.load.image(roomMapConfig.tilesetKey, roomMapConfig.tilesetUrl);
  this.load.tilemapTiledJSON(roomMapConfig.mapKey, roomMapConfig.mapUrl);
  Object.keys(charactors).forEach(
    char => {
      charactors[char].preloadAssets(this)
    }
  )
}

const registerInputEvents = scene => {
  cursors = scene.input.keyboard.createCursorKeys()
  scene.input.keyboard.on(
    'keydown', e => {
      switch (e.key) {
        case 'w': {
          scene.scale.toggleFullscreen();
          break
        }
        case 'a': {
          methods.init()
          const mapConfig: MapConfig = dungeonMapConfig
          scene.scene.restart({ mapConfig })
          break
        }
        case 's': {
          methods.init()
          const mapConfig: MapConfig = roomMapConfig
          scene.scene.restart({ mapConfig })
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
        default: {
          // do nothing
        }
      }
    }
  )
}

function create() {
  registerInputEvents(this)
  FOV.create(this, mapConfig)

  Object.keys(charactors).forEach(
    char => {
      charactors[char].createAnims(this)
    }
  )

  socket.emit('init-player')
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
  const changeDirection = !_.isEqual(_velocity, player.velocity)
  methods.movePlayer(userId, { velocity: _velocity })
  const isBlocked = !player.phaserObject.body.blocked.none
  if (changeDirection || isBlocked) {
    socket.emit('move-player', _.omit(player, 'phaserObject'))
  }
}

function update(t, dt) {
  const player = methods.getPlayer(userId)
  if (!player) return
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