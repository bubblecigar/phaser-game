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
    tile: null
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

  return collisionTargets
}

const registerWorlEvents = (scene, methods, socketMethods) => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const collistionTargets = classifyCollisionTargets(bodyA, bodyB)
    const { player, bullet, tile } = collistionTargets
    if (player && player.isUser && tile) {
      const dy = tile.body.position.y - player.body.position.y
      const tileAtTop = dy <= 0
      if (!tileAtTop) {
        player.body.gameObject.setData({ touched: true })
      }
    } else if (player && bullet) {
      if (player.data.id === bullet.data.builderId) {
        // player own the bullet, do nothing
        return
      }
      if (player.isUser) {
        socketMethods.broadcast(methods, 'onHit', player.data.id, _.omit(bullet.data, 'phaserObject'))
        scene.cameras.main.shake(100, 0.01)
      }
      bullet.data.phaserObject._destroy()
    } else if (bullet && tile) {
      bullet.data.phaserObject._destroy()
    }
  })

  scene.matter.world.on('collisionend', function (event, bodyA, bodyB) {
    // to be done
  })
}

export default registerWorlEvents