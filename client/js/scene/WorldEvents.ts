import { getLocalUserData } from '../user'

const registerWorlEvents = scene => {
  scene.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (!dataA || !dataB) {
      return
    }
    const user = getLocalUserData()
    const userIsA = dataA.id === user.userId
    const userIsB = dataB.id === user.userId
    const userInvolved = userIsA || userIsB
    if (userInvolved) {
      const userBody = userIsA ? bodyA : bodyB
      const userData = userIsA ? dataA : dataB
      const targetBody = userIsA ? bodyB : bodyA
      const targetData = userIsA ? dataB : dataA
      const triggerIndoorSensor = targetData.interface === 'fov-sensor'
      const isUserSensor = userBody.label === 'body-sensor'
      if (isUserSensor && triggerIndoorSensor) {
        const isOverlap = scene.matter.overlap(userBody, targetBody.parent.parts)
        if (isOverlap) {
          userBody.gameObject.setTint(0x000000)
        } else {
          userBody.gameObject.setTint(0xFFFFFF)
        }
      }
    }
  })
  scene.matter.world.on('collisionend', function (event, bodyA, bodyB) {
    const dataA = bodyA?.gameObject?.data?.getAll()
    const dataB = bodyB?.gameObject?.data?.getAll()
    if (!dataA || !dataB) {
      return
    }
    const user = getLocalUserData()
    const userIsA = dataA.id === user.userId
    const userIsB = dataB.id === user.userId
    const userInvolved = userIsA || userIsB
    if (userInvolved) {
      const userBody = userIsA ? bodyA : bodyB
      const userData = userIsA ? dataA : dataB
      const targetBody = userIsA ? bodyB : bodyA
      const targetData = userIsA ? dataB : dataA
      const triggerIndoorSensor = targetData.interface === 'fov-sensor'
      const isUserSensor = userBody.label === 'body-sensor'
      if (isUserSensor && triggerIndoorSensor) {
        const isOverlap = scene.matter.overlap(userBody, targetBody.parent.parts)
        if (isOverlap) {
          userBody.gameObject.setTint(0x000000)
        } else {
          userBody.gameObject.setTint(0xFFFFFF)
        }
      }
    }
  })
}


export default registerWorlEvents