import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import hammer from '../../../items/hammer'

export const shootHammer = ({ scene, bulletsRef, from, to, builderId, isUser }) => {
  const velocity = 1
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const id = v4()

  const { size, origin } = hammer.matterConfig
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const body = Bodies.rectangle(from.x, from.y, size.width, size.height, {
    ignoreGravity: true,
    isSensor: true
  })

  const matter = scene.matter.add.sprite(from.x, from.y, hammer.spritesheetConfig.spritesheetKey)
  matter.setExistingBody(body)
  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setAngularVelocity(0.3)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setFriction(0, 0.01, 0)

  matter.setCollisionCategory(
    isUser
      ? collisionCategories.CATEGORY_PLAYER_BULLET
      : collisionCategories.CATEGORY_ENEMY_BULLET
  )
  matter.setCollidesWith([
    collisionCategories.CATEGORY_PLAYER,
    collisionCategories.CATEGORY_MAP_BLOCK
  ])

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
    1500,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}