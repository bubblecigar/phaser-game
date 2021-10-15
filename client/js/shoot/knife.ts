import { v4 } from 'uuid'
import bulletsRef from './ref'

const createArrowHead = (scene, position) => {
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const headBody = Bodies.rectangle(position.x, position.y - 6, 2, 2)
  const headMatter = scene.matter.add.sprite(position.x, position.y, 'arrow_sprite')
  headMatter.setExistingBody(headBody)
  headMatter.setOrigin(0.5, 0.1)
  headMatter.setFriction(1, 0, 0)
  headMatter.setMass(0.01)

  return headMatter
}

const createArrowFeather = (scene, position) => {
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const feather = scene.add.rectangle(position.x, position.y + 6, 2, 2)
  const featherBody = Bodies.rectangle(position.x, position.y + 6, 2, 2)
  const featherMatter = scene.matter.add.gameObject(feather)
  featherMatter.setExistingBody(featherBody)
  featherMatter.setMass(0.001)
  featherMatter.setFriction(0, 0.4, 0)
  featherMatter.setCollisionGroup(-1)

  return featherMatter
}

export const shootKnife = ({ scene, from, to, builderId }) => {
  const velocity = 5
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, 'dagger_sprite')

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setIgnoreGravity(true)
  matter.setAngularVelocity(0.7)


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
    300,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}