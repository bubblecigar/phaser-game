import { v4 } from 'uuid'
import items from '../items/index'
import { playAnimation } from './utils'

export const rain = ({
  scene,
  itemStorage,
  performer,
  target,
  collisionCategory,
  collisionTargets,
  options
}) => {
  const id = v4()
  const from = performer.position
  const to = target

  const randomString = options.randomNumber.toFixed(5)
  const randomIndex_1 = randomString[2]
  const randomIndex_2 = randomString[3]
  const randomIndex_3 = randomString[4]
  const randomSizeFactor = 0.3 + randomIndex_3 * 0.06

  const velocity = 2
  const item = items[options.item] || items["iceFlask"]
  const matter = scene.matter.add.sprite(from.x, from.y, item.spritesheetConfig.spritesheetKey)
  matter.setScale(randomSizeFactor)
  matter.setCircle(8 * randomSizeFactor)

  playAnimation(item, matter)

  matter.setX(from.x + 2 * randomIndex_1 * (Math.sign(from.x - to.x)))
  matter.setY(from.y - 2 * randomIndex_2)
  matter.setVelocityX(0.2 * randomIndex_1 * (Math.sign(from.x - to.x)))
  matter.setVelocityY(-0.08 * randomIndex_2)
  matter.setAngularVelocity(0.15)
  matter.setIgnoreGravity(true)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  const rush = () => {
    if (itemStorage[id]) {
      const from = matter.body.position
      const rushVelocity = 3 * velocity
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
    if (itemStorage[id]) {
      delete itemStorage[id]
      matter.destroy()
    }
  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId: performer.id,
    damage: 7 * options.damage * randomSizeFactor,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    1000,
    () => destroy(),
    null,
    scene
  )

  itemStorage[id] = { id, update, destroy }
}