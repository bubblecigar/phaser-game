import { v4 } from 'uuid'
import items from '../items/index'
import { normalizeMatter, playAnimation } from './utils'

export const spin = ({
  scene,
  itemStorage,
  performer,
  from,
  to,
  collisionCategory,
  collisionTargets,
  options
}) => {
  const velocity = 4
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const item = items[options.item] || items["dagger"]
  const matter = scene.matter.add.sprite(from.x, from.y, item.spritesheetConfig.spritesheetKey)
  normalizeMatter(performer, item, matter)

  matter.setFriction(0, 0, 0)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setAngularVelocity(1)
  matter.setIgnoreGravity(true)
  matter.setBounce(1)

  playAnimation(item, matter)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  scene.time.delayedCall(400, () => {
    if (itemStorage[id]) {
      matter.setVelocityX(-velocity * Math.cos(angle))
      matter.setVelocityY(-velocity * Math.sin(angle))
    }
  }, null, scene)

  const update = () => {

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
    damage: 5 * options.damage,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    800,
    () => destroy(),
    null,
    scene
  )

  itemStorage[id] = { id, update, destroy }
}