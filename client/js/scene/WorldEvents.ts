import { getLocalUserData } from '../user'

let cameraMask

const fovInteraction = (scene, userBody, userData, targetBody, targetData) => {
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

const registerWorlEvents = scene => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const playerTargetArray = getPlayerTargetArray(bodyA, bodyB)
    if (playerTargetArray) {
      const [playerBody, playerData, targetBody, targetData] = playerTargetArray
      const isUser = playerData.id === getLocalUserData().userId
      if (isUser) {
        if (
          playerBody.label === 'body-sensor' &&
          targetData.interface === 'fov-sensor'
        ) {
          fovInteraction(scene, ...playerTargetArray)
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
          fovInteraction(scene, ...playerTargetArray)
        }
      }
    }
  }
}

export default registerWorlEvents