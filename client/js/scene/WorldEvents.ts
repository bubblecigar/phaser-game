import { getLocalUserData } from '../user'

let cameraMask

const playerInteraction = (scene, userBody, userData, targetBody, targetData) => {
  const isUserSensor = userBody.label === 'body-sensor'
  const triggerIndoorSensor = targetData.interface === 'fov-sensor'
  if (isUserSensor && triggerIndoorSensor) {
    const isOverlap = scene.matter.overlap(userBody, targetBody.parent.parts)
    const camera = scene.cameras.main
    if (isOverlap) {
      cameraMask = camera.mask || cameraMask
      camera.clearMask()
    } else {
      camera.setMask(cameraMask)
    }
  }
}

const registerWorlEvents = scene => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (!dataA || !dataB) {
      return
    }
    const playerIsA = dataA.interface === 'Player'
    const playerIsB = dataB.interface === 'Player'
    const playerInvolved = playerIsA || playerIsB
    if (playerInvolved) {
      const userBody = playerIsA ? bodyA : bodyB
      const userData = playerIsA ? dataA : dataB
      const targetBody = playerIsA ? bodyB : bodyA
      const targetData = playerIsA ? dataB : dataA
      playerInteraction(scene, userBody, userData, targetBody, targetData)
    }
  })
  scene.matter.world.on('collisionend', function (event, bodyA, bodyB) {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (!dataA || !dataB) {
      return
    }
    const playerIsA = dataA.interface === 'Player'
    const playerIsB = dataB.interface === 'Player'
    const playerInvolved = playerIsA || playerIsB
    if (playerInvolved) {
      const userBody = playerIsA ? bodyA : bodyB
      const userData = playerIsA ? dataA : dataB
      const targetBody = playerIsA ? bodyB : bodyA
      const targetData = playerIsA ? dataB : dataA
      playerInteraction(scene, userBody, userData, targetBody, targetData)
    }
  })
}


export default registerWorlEvents