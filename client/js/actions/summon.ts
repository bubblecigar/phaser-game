import { v4 } from 'uuid'
import items from '../items/index'
import { normalizeMatter, playAnimation } from './utils'

export const summon = ({
  scene,
  itemStorage,
  performer,
  target,
  collisionCategory,
  collisionTargets,
  options
}) => {
  const velocity = 2
  const id = v4()
  const from = performer.position
  const to = target

  const item = items[options.item] || items["muddy"]
  const { size, origin, type } = item.matterConfig
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  let body
  if (type === 'rectangle') {
    body = Bodies.rectangle(from.x, from.y, size.width, size.height)
  } else {
    body = Bodies.circle(from.x, from.y, size.radius)
  }

  const matter = scene.matter.add.sprite(from.x, from.y, item.spritesheetConfig.spritesheetKey)
  normalizeMatter(performer, item, matter)

  matter.setExistingBody(body)
  matter.setFixedRotation(true)
  matter.setFriction(0, 0, 0)

  playAnimation(item, matter)

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
    if (itemStorage[id]) {
      delete itemStorage[id]
      matter.destroy()
    }
  }

  matter.setData({
    id,
    interface: 'Bullet',
    builderId: performer.id,
    damage: 8 * options.damage,
    phaserObject: matter,
    destroy
  })

  const move = (calls: number) => {
    if (itemStorage[id]) {
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
    if (itemStorage[id]) {
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

  itemStorage[id] = { id, update, destroy }
}