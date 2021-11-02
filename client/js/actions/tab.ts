import { v4 } from 'uuid'
import items from '../items/index'
import { normalizeMatter, playAnimation } from './utils'

export const tab = ({
  scene,
  itemStorage,
  performer,
  from,
  to,
  collisionCategory,
  collisionTargets,
  options
}) => {
  const id = v4()
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const item = items[options.item] || items["dagger"]
  const matter = scene.matter.add.sprite(from.x, from.y, item.spritesheetConfig.spritesheetKey)
  normalizeMatter(performer, item, matter)

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setIgnoreGravity(true)
  matter.setDepth(3)
  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  playAnimation(item, matter)

  let distance = 0
  const update = (t, dt) => {
    if (performer?.phaserObject) {
      distance += dt * 0.1
      matter.setX(performer.phaserObject.x + distance * Math.cos(angle))
      matter.setY(performer.phaserObject.y + distance * Math.sin(angle))
    }
  }
  const destroy = () => {

  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId: performer.id,
    damage: 10 * options.damage,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    200,
    () => {
      if (itemStorage[id]) {
        delete itemStorage[id]
        matter.destroy()
      }
    },
    null,
    scene
  )

  itemStorage[id] = { id, update, destroy }
}