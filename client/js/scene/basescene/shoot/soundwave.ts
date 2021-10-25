import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'

export const shootSoundWave = ({ scene, bulletsRef, from, to, builderId, isUser, shooter, collisionCategory, collisionTargets }) => {
  const id = v4()

  const circle = scene.add.circle(from.x, from.y, 8)
  circle.setStrokeStyle(2, 0xffffff, 0.7)

  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const body = Bodies.circle(from.x, from.y, 8, {
    ignoreGravity: true,
    isSensor: true
  })

  const matter = scene.matter.add.gameObject(circle)
  matter.setExistingBody(body)
  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  matter.setDepth(11)

  const update = (t, dt) => {
    if (bulletsRef[id]) {
      circle.setRadius(circle.radius + dt * 0.1)
      const ratio = circle.radius / body.circleRadius
      Phaser.Physics.Matter.Matter.Body.scale(body, ratio, ratio)
      if (shooter && shooter.phaserObject && shooter.phaserObject.body) {
        matter.setX(shooter.phaserObject.x)
        matter.setY(shooter.phaserObject.y)
      }
    }
  }
  const destroy = () => {
    // would not destroy on collide with player
  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId,
    damage: 5,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    500,
    () => {
      if (bulletsRef[id]) {
        delete bulletsRef[id]
        matter.destroy()
      }
    },
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}