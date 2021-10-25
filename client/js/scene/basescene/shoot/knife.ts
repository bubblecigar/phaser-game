import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'

export const shootKnife = ({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets }) => {
  const velocity = 5
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, 'dagger_sprite')

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setIgnoreGravity(true)
  matter.setAngularVelocity(0.7)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  const update = () => {

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
    damage: 2,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    300,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}