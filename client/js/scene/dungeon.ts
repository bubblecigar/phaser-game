import Phaser from 'phaser'
import { v4 } from 'uuid';
import _ from 'lodash'
import { gameMethods, gameState, Player, Item } from '../../../share/game'
import { getLocalUserData } from '../user'
import charactors from '../charactors/Charactors'
import items from '../items/Items'
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
  methods = gameMethods('client')({ userId, Phaser, charactors, items, scene: this })
  registerSocketEvents(methods)
  registerWorldEvents(this, methods)
}

function preload() {
  this.load.image(mapConfig.tilesetKey, mapConfig.tilesetUrl)
  this.load.tilemapTiledJSON(mapConfig.mapKey, mapConfig.mapUrl)
  Object.keys(charactors).forEach(
    key => {
      const char = charactors[key]
      this.load.spritesheet(char.spritesheetConfig.spritesheetKey, char.spritesheetConfig.spritesheetUrl, char.spritesheetConfig.options)
    }
  )
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      this.load.spritesheet(item.spritesheetConfig.spritesheetKey, item.spritesheetConfig.spritesheetUrl, item.spritesheetConfig.options)
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
          const getNearestReachableItem = (position, items = gameState.items): false | Item => {
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
          const itemConstructor: Item = {
            interface: 'Item',
            id: v4(),
            itemKey: 'coin',
            position: player.position,
            phaserObject: null
          }
          const item: Item = methods.addItem(itemConstructor)
          socket.emit('addItem', _.omit(item, 'phaserObject'))
          break
        }
        case 'c': {
          const randomCharactorKey = Object.keys(charactors)[Math.floor(Math.random() * 10) % (Object.keys(charactors).length)]
          const player: Player = methods.getPlayer(getLocalUserData().userId)
          const _player: Player = _.omit(_.clone(player), 'phaserObject')
          _player.charactorKey = randomCharactorKey
          methods.setPlayer(_player)
          socket.emit('setPlayer', _player)
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
  const player = {
    id: userId,
    charactorKey: 'tinyZombie',
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
    key => {
      const char = charactors[key]
      Object.keys(char.animsConfig).forEach(
        _key => {
          const animConfig = char.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(char.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
            frameRate: 8,
            repeat: -1
          })
        }
      )
    }
  )
  Object.keys(items).forEach(
    key => {
      const item = items[key]
      Object.keys(item.animsConfig).forEach(
        _key => {
          const animConfig = item.animsConfig[_key]
          this.anims.create({
            key: animConfig.key,
            frames: this.anims.generateFrameNumbers(item.spritesheetConfig.spritesheetKey, { frames: animConfig.frames }),
            frameRate: 8,
            repeat: -1
          })
        }
      )
    }
  )

  createPlayer()
  const player: Player = methods.getPlayer(getLocalUserData().userId)
  this.scene.launch('GUI', { player })
}

const movePlayer = (player: Player) => {
  const char = charactors[player.charactorKey]
  const velocity = char.velocity
  const _velocity = { x: 0, y: 0 }
  if (cursors.left.isDown) {
    _velocity.x = -velocity
  } else if (cursors.right.isDown) {
    _velocity.x = velocity
  } else {
    _velocity.x = 0
  }
  if (cursors.up.isDown) {
    _velocity.y = -velocity
  } else if (cursors.down.isDown) {
    _velocity.y = velocity
  } else {
    _velocity.y = 0
  }
  const _player = _.clone(player)
  _player.velocity = _velocity
  methods.movePlayer(_.omit(_player, 'position'))
  socket.emit('movePlayer', _.omit(player, 'phaserObject'))
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