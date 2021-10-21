import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import gameState from '../../../game/state'

export const shootSoundWave = ({ scene, bulletsRef, from, to, builderId, isUser }) => {
  const id = v4()

  const builder = gameState.players.find(p => p.id === builderId)

  const circle = scene.add.circle(from.x, from.y, 8)
  circle.setStrokeStyle(2, 0xffffff, 0.7)

  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const body = Bodies.circle(from.x, from.y, 8, {
    ignoreGravity: true,
    isSensor: true
  })

  const matter = scene.matter.add.gameObject(circle)
  matter.setExistingBody(body)
  matter.setCollisionCategory(
    isUser
      ? collisionCategories.CATEGORY_PLAYER_BULLET
      : collisionCategories.CATEGORY_ENEMY_BULLET
  )
  matter.setCollidesWith([
    collisionCategories.CATEGORY_PLAYER,
    collisionCategories.CATEGORY_MAP_BLOCK
  ])

  matter.setDepth(11)

  const update = (t, dt) => {
    circle.setRadius(circle.radius + dt * 0.1)
    body.circleRadius = body.circleRadius + dt * 0.1
    if (builder) {
      matter.setX(builder.position.x)
      matter.setY(builder.position.y)
    }
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
    damage: 5,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    500,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}