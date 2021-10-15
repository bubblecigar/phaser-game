import { v4 } from 'uuid'
import bulletsRef from './ref'

export const shootFireBall = ({ scene, from, to, builderId }) => {
  const velocity = 3
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, 'fireball_sprite')

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setIgnoreGravity(true)
  // matter.setSensor(true)
  matter.setDepth(50)
  matter.play('fireball_idle')


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
    damage: 10,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    700,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}