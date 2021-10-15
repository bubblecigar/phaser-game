import { getLocalUserData } from '../../user'
import _ from 'lodash'
import { v4 } from 'uuid'
import { Item } from '../../Interface'

const classifyCollisionTargets = (bodyA, bodyB) => {
  const collisionTargets = {
    player: null,
    bullet: null,
    terrainBlock: null,
    item: null,
    sensor: null
  }

  try {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (dataA && dataA.interface === 'Player') {
      collisionTargets.player = {
        data: dataA,
        body: bodyA,
        isUser: dataA.id === getLocalUserData().userId
      }
    } else if (dataB && dataB.interface === 'Player') {
      collisionTargets.player = {
        data: dataB,
        body: bodyB,
        isUser: dataB.id === getLocalUserData().userId
      }
    }
  } catch (e) {
    // no player
  }

  try {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (dataA && dataA.interface === 'Bullet') {
      collisionTargets.bullet = {
        data: dataA,
        body: bodyA
      }
    } else if (dataB && dataB.interface === 'Bullet') {
      collisionTargets.bullet = {
        data: dataB,
        body: bodyB
      }
    }
  } catch (e) {
    // no bullet
  }

  try {
    if (bodyA.gameObject?.tile || bodyA.label === 'world-bound-wall') {
      collisionTargets.terrainBlock = {
        body: bodyA
      }
    } else if (bodyB.gameObject?.tile || bodyB.label === 'world-bound-wall') {
      collisionTargets.terrainBlock = {
        body: bodyB
      }
    }
  } catch (e) {
    // no terrainBlock
  }

  try {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (dataA && dataA.interface === 'Item') {
      collisionTargets.item = {
        data: dataA,
        body: bodyA
      }
    } else if (dataB && dataB.interface === 'Item') {
      collisionTargets.item = {
        data: dataB,
        body: bodyB
      }
    }
  } catch (e) {
    // no item
  }

  try {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (dataA && dataA.interface === 'Sensor') {
      collisionTargets.sensor = {
        data: dataA,
        body: bodyA
      }
    } else if (dataB && dataB.interface === 'Sensor') {
      collisionTargets.sensor = {
        data: dataB,
        body: bodyB
      }
    }
  } catch (e) {
    // no sensor
  }

  return collisionTargets
}

const registerWorldEvents = (scene, methods, socketMethods) => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const collistionTargets = classifyCollisionTargets(bodyA, bodyB)
    const { player, bullet, terrainBlock, item, sensor } = collistionTargets
    if (player && player.isUser && terrainBlock) {
      const playerTileXY = scene.map.worldToTileXY(player.body.position.x, player.body.position.y)
      const blockTileXY = scene.map.worldToTileXY(terrainBlock.body.position.x, terrainBlock.body.position.y)
      const blockAtTop = playerTileXY.y > blockTileXY.y && playerTileXY.x === blockTileXY.x
      if (!blockAtTop) {
        player.body.gameObject.setData({ touched: true })
      }
    } else if (player && player.isUser && sensor) {
      switch (sensor.data.name) {
        case ('ready_zone'): {
          methods.changeReadyState(true)
          break
        }
        case ('exit_room_zone'): {
          socketMethods.leaveRoom()
          scene.scene.start('loginScene')
          break
        }
        default: {
          console.log('user enter unknown sensor')
        }
      }
    } else if (player && bullet) {
      if (player.data.id === bullet.data.builderId) {
        // player own the bullet, do nothing
        return
      }
      if (player.isUser) {
        socketMethods.clientsInScene(scene.scene.key, methods, 'onHit', player.data.id, _.omit(bullet.data, 'phaserObject'))
        scene.cameras.main.shake(100, 0.01)
        const _player = methods.getPlayer(player.data.id)
        if (_player.health <= 0) {
          socketMethods.clientsInScene(scene.scene.key, methods, 'onDead', player.data.id)

          const coinConstructor: Item = {
            interface: 'Item',
            builderId: player.data.id,
            id: v4(),
            itemKey: 'coin',
            position: _player.position,
            velocity: { x: 0, y: -0.2 },
            phaserObject: null
          }

          socketMethods.clientsInScene(scene.scene.key, methods, 'addItem', coinConstructor)
          socketMethods.server('addItem', coinConstructor)
        }
      }
    } else if (bullet && terrainBlock) {
      // do nothing
    } else if (player && item) {
      if (item.data.itemKey === 'coin') {
        if (player.isUser) {
          socketMethods.clientsInScene(scene.scene.key, methods, 'collectItem', player.data.id, _.omit(item.data, 'phaserObject'))
          socketMethods.server('collectItem', item.data.id)
          scene.cameras.main.shake(100, 0.01)
        } else {
          item.data.phaserObject.destroy()
        }
      }
    }
  })

  scene.matter.world.on('collisionend', function (event, bodyA, bodyB) {
    const collistionTargets = classifyCollisionTargets(bodyA, bodyB)
    const { player, bullet, terrainBlock, item, sensor } = collistionTargets
    if (player && player.isUser && sensor) {
      switch (sensor.data.name) {
        case ('ready_zone'): {
          methods.changeReadyState(false)
          break
        }
        default: {
          console.log('user leave unknown sensor')
        }
      }
    }
  })
}

export default registerWorldEvents