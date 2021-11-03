import { v4 } from 'uuid'
import items from '../items/index'
import { normalizeMatter, playAnimation } from './utils'

export const shoot = ({
  scene,
  itemStorage,
  performer,
  from,
  to,
  collisionCategory,
  collisionTargets,
  options
}) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()
  const velocity = 4

  const item = items[options.item] || items["fireball"]

  const matter = scene.matter.add.sprite(from.x, from.y, item.spritesheetConfig.spritesheetKey)

  normalizeMatter(performer, item, matter)

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setFixedRotation(true)
  matter.setIgnoreGravity(true)
  matter.setFriction(1, 0, 1)

  playAnimation(item, matter)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  const update = () => {
    const velocity = matter.body.velocity
    if (Math.abs(velocity.x) + Math.abs(velocity.y) <= 1) {
      destroy()
    }
  }

  const destroy = () => {
    if (itemStorage[id]) {
      delete itemStorage[id]
    }
    matter.destroy()
  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId: performer.id,
    damage: 6 * options.damage,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    5000,
    () => destroy(),
    null,
    scene
  )

  itemStorage[id] = { id, update, destroy }
}