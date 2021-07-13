import { getLocalUserData } from '../user'
import socket from '../socket'
import _ from 'lodash'

let cameraMask

const updateCamera = (scene, userBody, userData, targetBody, targetData) => {
  const isOverlap = scene.matter.overlap(userBody, targetBody.parent.parts)
  const camera = scene.cameras.main
  if (isOverlap) {
    cameraMask = camera.mask || cameraMask
    camera.clearMask()
  } else {
    camera.setMask(cameraMask)
  }
}

const getPlayerTargetArray = (bodyA, bodyB): false | [any, any, any, any] => {
  const dataA = bodyA?.gameObject?.data?.getAll()
  const dataB = bodyB?.gameObject?.data?.getAll()
  if (!dataA || !dataB) {
    return false
  }
  const playerData = dataA.interface === 'Player'
    ? dataA
    : (
      dataB.interface === 'Player'
        ? dataB
        : null
    )
  if (!playerData) {
    return false
  }
  return playerData === dataA
    ? [bodyA, dataA, bodyB, dataB]
    : [bodyB, dataB, bodyA, dataA]
}

const getBulletTargetArray = (bodyA, bodyB): false | [any, any, any, any] => {
  const dataA = bodyA?.gameObject?.data?.getAll()
  const dataB = bodyB?.gameObject?.data?.getAll()

  const bulletData = dataA?.interface === 'Bullet'
    ? dataA
    : (
      dataB?.interface === 'Bullet'
        ? dataB
        : null
    )
  if (!bulletData) {
    return false
  }
  return bulletData === dataA
    ? [bodyA, dataA, bodyB, dataB]
    : [bodyB, dataB, bodyA, dataA]
}


const registerWorlEvents = (scene, methods) => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const playerTargetArray = getPlayerTargetArray(bodyA, bodyB)
    if (playerTargetArray) {
      const [playerBody, playerData, targetBody, targetData] = playerTargetArray
      const isUser = playerData.id === getLocalUserData().userId
      if (
        isUser &&
        playerBody.label === 'body-sensor' &&
        targetData.interface === 'fov-sensor'
      ) {
        updateCamera(scene, ...playerTargetArray)
      }
      if (
        playerBody.label === 'player-body' &&
        targetData.interface === 'Bullet'
      ) {
        if (isUser) {
          methods.onHit(playerData.id, targetData)
          socket.emit('onHit', playerData.id, _.omit(targetData, 'phaserObject'))
        }
        targetData.phaserObject.destroy()
      }
    } else {
      const bulletTargetArray = getBulletTargetArray(bodyA, bodyB)
      if (bulletTargetArray) {
        const [bulletBody, bulletData, targetBody, targetData] = bulletTargetArray
        if (
          targetBody.gameObject?.tile &&
          bulletData.interface === 'Bullet'
        ) {
          bulletData.phaserObject.destroy()
        }
      }
    }
  })

  scene.matter.world.on('collisionend', function (event, bodyA, bodyB) {
    const playerTargetArray = getPlayerTargetArray(bodyA, bodyB)
    if (playerTargetArray) { // player involved
      const [playerBody, playerData, targetBody, targetData] = playerTargetArray
      const isUser = playerData.id === getLocalUserData().userId
      if (isUser) {
        if (
          playerBody.label === 'body-sensor' &&
          targetData.interface === 'fov-sensor'
        ) {
          updateCamera(scene, ...playerTargetArray)
        }
      }
    }
  })
}

export default registerWorlEvents