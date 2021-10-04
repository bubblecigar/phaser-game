import { getLocalUserData } from '../../user'
import _ from 'lodash'

// let cameraMask

// const updateCamera = (scene, userBody, userData, targetBody, targetData) => {
//   const isOverlap = scene.matter.overlap(userBody, targetBody.parent.parts)
//   const camera = scene.cameras.main
//   if (isOverlap) {
//     cameraMask = camera.mask || cameraMask
//     camera.clearMask()
//   } else {
//     camera.setMask(cameraMask)
//   }
// }

const classifyCollisionTargets = (bodyA, bodyB) => {
  const collisionTargets = {
    player: null,
    bullet: null,
    tile: null,
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
    if (bodyA.gameObject?.tile) {
      collisionTargets.tile = {
        body: bodyA
      }
    } else if (bodyB.gameObject?.tile) {
      collisionTargets.tile = {
        body: bodyB
      }
    }
  } catch (e) {
    // no tile
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

const registerWorlEvents = (scene, methods, socketMethods) => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const collistionTargets = classifyCollisionTargets(bodyA, bodyB)
    const { player, bullet, tile, item, sensor } = collistionTargets
    if (player && player.isUser && tile) {
      const dy = tile.body.position.y - player.body.position.y
      const tileAtTop = dy <= 0
      if (!tileAtTop) {
        player.body.gameObject.setData({ touched: true })
      }
    } else if (player && player.isUser && sensor) {
      switch (sensor.data.name) {
        case ('ready_zone'): {
          console.log('user enter ready_zone')
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
        }
      }
      bullet.data.destroy()
    } else if (bullet && tile) {
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
    // to be done
  })
}

export default registerWorlEvents