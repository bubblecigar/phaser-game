import { v4 } from 'uuid'
import collisionCategories from '../collisionCategories'
import gameState from '../../../game/state'

export const tab = ({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets }) => {
  const builder = gameState.players.find(p => p.id === builderId)
  const velocity = 5
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, 'dagger_sprite')

  matter.setAngle((angle * 180 / Math.PI) + 90)
  matter.setIgnoreGravity(true)
  matter.setDepth(3)
  matter.setCollisionCategory(collisionCategory)
  matter.setCollidesWith(collisionTargets)

  let distance = 0
  const update = (t, dt) => {
    if (builder) {
      distance += dt * 0.05
      matter.setX(builder.position.x + distance * Math.cos(angle))
      matter.setY(builder.position.y + distance * Math.sin(angle))
    }
  }
  const destroy = () => {

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
    200,
    () => {
      if (bulletsRef[id]) {
        delete bulletsRef[id]
        matter.destroy()
      }
    },
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}