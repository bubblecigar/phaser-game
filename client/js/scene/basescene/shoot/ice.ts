import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import iceFlask from '../../../items/iceFlask'
export const shootIce = ({ scene, bulletsRef, from, to, builderId, isUser, options, collisionCategory, collisionTargets }) => {
  const id = v4()
  const randomString = options.randomNumber.toFixed(5)
  const randomIndex_1 = randomString[2]
  const randomIndex_2 = randomString[3]
  const randomIndex_3 = randomString[4]
  const randomSizeFactor = 0.3 + randomIndex_3 * 0.06

  const velocity = 2
  const matter = scene.matter.add.sprite(from.x, from.y, iceFlask.spritesheetConfig.spritesheetKey)
  matter.setScale(randomSizeFactor)
  matter.setCircle(8 * randomSizeFactor)
  matter.play(iceFlask.animsConfig.idle.key)

  matter.setX(from.x + 2 * randomIndex_1 * (Math.sign(from.x - to.x)))
  matter.setY(from.y - 2 * randomIndex_2)
  matter.setVelocityX(0.2 * randomIndex_1 * (Math.sign(from.x - to.x)))
  matter.setVelocityY(-0.08 * randomIndex_2)
  matter.setAngularVelocity(0.15)
  matter.setIgnoreGravity(true)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  const rush = () => {
    if (bulletsRef[id]) {
      const from = matter.body.position
      const rushVelocity = 5 * velocity
      const angle = Math.atan2(to.y - from.y, to.x - from.x)
      matter.setVelocityX(rushVelocity * Math.cos(angle))
      matter.setVelocityY(rushVelocity * Math.sin(angle))
    }
  }
  scene.time.delayedCall(500, () => rush(), null, scene)


  const update = () => {
    // const velocity = matter.body.velocity
    // if (Math.abs(velocity.x) + Math.abs(velocity.y) <= 1) {
    //   destroy()
    // }
  }

  const destroy = () => {
    if (bulletsRef[id]) {
      delete bulletsRef[id]
      matter.destroy()
    }
  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId,
    damage: 10 * randomSizeFactor,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    1000,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}