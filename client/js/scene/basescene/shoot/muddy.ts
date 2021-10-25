import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import muddy from '../../../items/muddy'

export const shootMuddy = ({ scene, bulletsRef, from, to, builderId, isUser, options, collisionCategory, collisionTargets }) => {
  const velocity = 2
  const id = v4()

  const { size, origin } = muddy.matterConfig
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const body = Bodies.rectangle(from.x, from.y, size.width, size.height)

  const matter = scene.matter.add.sprite(from.x, from.y, muddy.spritesheetConfig.spritesheetKey)

  matter.setExistingBody(body)
  matter.setFixedRotation(true)
  matter.setFriction(0, 0, 0)
  matter.play(muddy.animsConfig.idle.key)

  const toRight = from.x < to.x
  if (toRight) {
    matter.setVelocityX(velocity)

  } else {
    matter.setFlipX(true)
    matter.setVelocityX(-velocity)
  }

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
    damage: 8,
    phaserObject: matter,
    destroy
  })

  const move = (calls: number) => {
    if (bulletsRef[id]) {
      const behaviorIndex = Math.floor((options.randomNumber * (2 * calls)) % (2 * calls))
      const direction = behaviorIndex % 2 === 0 ? 1 : -1
      matter.setVelocityX(direction * velocity)
      matter.setVelocityY(-2 * velocity)
      if (direction === 1) {
        matter.setFlipX(false)
      } else {
        matter.setFlipX(true)
      }
    }
  }
  const rest = () => {
    if (bulletsRef[id]) {
      matter.setVelocityX(0)
    }
  }

  scene.time.delayedCall(400, () => rest(), null, scene)
  scene.time.delayedCall(800, () => move(1), null, scene)
  scene.time.delayedCall(1200, () => rest(), null, scene)
  scene.time.delayedCall(1600, () => move(2), null, scene)

  scene.time.delayedCall(
    2000,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}