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

export const shootArrow = ({ scene, from, to, builderId }) => {
  const velocity = 10
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()
  const headMatter = createArrowHead(scene, from)
  const featherMatter = createArrowFeather(scene, from)
  const constraint = scene.matter.add.constraint(headMatter.body, featherMatter.body, 12)
  headMatter.setVelocityX(velocity * Math.cos(angle))
  headMatter.setVelocityY(velocity * Math.sin(angle))

  const update = () => {
    const { x: x1, y: y1 } = headMatter
    const { x: x2, y: y2 } = featherMatter
    const angleDeg = Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI
    headMatter.setAngle(angleDeg + 90)
  }
  const destroy = () => {
    if (bulletsRef[id]) {
      delete bulletsRef[id]
      scene.matter.world.remove(constraint)
      headMatter.destroy()
      featherMatter.destroy()
    }
  }
  headMatter.setData({
    id,
    interface: 'Bullet',
    builderId,
    damage: 5,
    phaserObject: headMatter,
    destroy
  })

  scene.time.delayedCall(
    1000,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}