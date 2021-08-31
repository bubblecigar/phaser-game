
const createArrowHead = (scene, position) => {
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const headBody = Bodies.rectangle(position.x, position.y - 6, 2, 2)
  const headMatter = scene.matter.add.sprite(position.x, position.y, 'arrow_sprite')
  headMatter.setExistingBody(headBody)
  headMatter.setOrigin(0.5, 0.1)
  headMatter.setFriction(1, 0, 0)
  headMatter.setMass(0.01)
  headMatter.setCollisionGroup(-1)

  return headMatter
}

const createArrowFeather = (scene, position) => {
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const feather = scene.add.rectangle(position.x, position.y + 6, 2, 2)
  const featherBody = Bodies.rectangle(position.x, position.y + 6, 2, 2)
  const featherMatter = scene.matter.add.gameObject(feather)
  featherMatter.setExistingBody(featherBody)
  featherMatter.setIgnoreGravity(true)
  featherMatter.setMass(0.001)
  featherMatter.setFriction(0, 0.4, 0)
  featherMatter.setCollisionGroup(-1)

  return featherMatter
}

export const shoot = scene => ({ from, to, builderId }) => {
  const velocity = 9
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const headMatter = createArrowHead(scene, from)
  const featherMatter = createArrowFeather(scene, from)
  const constraint = scene.matter.add.constraint(headMatter.body, featherMatter.body, 12)

  // matter.setData({
  //   interface: 'Bullet',
  //   builderId,
  //   damage: 5,
  //   phaserObject: matter
  // })
  headMatter.setVelocityX(velocity * Math.cos(angle))
  headMatter.setVelocityY(velocity * Math.sin(angle))

  scene.time.delayedCall(
    1000,
    () => {
      scene.matter.world.remove(constraint)
      headMatter.destroy()
      featherMatter.destroy()
    },
    null,
    scene
  )
}