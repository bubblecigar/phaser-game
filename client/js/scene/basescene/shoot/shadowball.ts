import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'

export const shootShadowBall = ({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets }) => {
  const velocity = 5
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, 'shadow_ball_sprite', undefined, {
    shape: 'circle'
  })
  matter.setBoundingBox
  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setIgnoreGravity(true)
  matter.setBounce(1.2)
  matter.play('shadow_ball_idle')

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
    damage: 15,
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