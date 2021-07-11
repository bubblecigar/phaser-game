import { getLocalUserData } from '../user'

const registerWorlEvents = scene => {
  scene.matter.world.on('collisionactive', function (event, bodyA, bodyB) {
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
      if (triggerIndoorSensor) {
        const isOverlap = scene.matter.overlap(targetBody, userBody)
        if (isOverlap) {
          userBody.gameObject.setTint(0x999999)
        } else {
          userBody.gameObject.setTint(0x112299)
        }
      }
    }
  })
}


export default registerWorlEvents