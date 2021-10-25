import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import coin from '../../../items/coin'

export const shootCoin = ({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets }) => {
  const velocity = 4
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, coin.spritesheetConfig.spritesheetKey, undefined, {
    shape: coin.matterConfig.type,
    ...coin.matterConfig.size
  })

  matter.setFriction(0, 0, 0)
  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setIgnoreGravity(true)
  matter.setFixedRotation(true)
  matter.setBounce(1)
  matter.play(coin.animsConfig.idle.key)

  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  scene.time.delayedCall(400, () => {
    if (bulletsRef[id]) {
      matter.setVelocityX(-velocity * Math.cos(angle))
      matter.setVelocityY(-velocity * Math.sin(angle))
    }
  }, null, scene)

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
    800,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}