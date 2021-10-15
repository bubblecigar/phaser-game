import { v4 } from 'uuid'
import bulletsRef from './ref'
import collisionCategories from '../collisionCategories'
import potions from '../../../items/potion'

export const shootPotion = ({ scene, from, to, builderId, isUser, options }) => {
  const velocity = 2
  const angle = Math.atan2(to.y - from.y, to.x - from.x)

  const id = v4()

  const matter = scene.matter.add.sprite(from.x, from.y, potions.spritesheetConfig.spritesheetKey, undefined, {
    shape: {
      type: potions.matterConfig.type,
      ...potions.matterConfig.size
    }
  })
  matter.setDepth(9)
  matter.setMass(0.1)
  matter.setVelocityX(velocity * Math.cos(angle))
  matter.setVelocityY(velocity * Math.sin(angle))
  matter.setFriction(1, 0.01, 1)
  matter.setBounce(0.1)

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

  const randomIndex = Math.floor(options.randomNumber * 4)

  let potionType
  if (randomIndex === 0) { potionType = 'potion_heal' } else
    if (randomIndex === 1) { potionType = 'potion_ice' } else
      if (randomIndex === 2) { potionType = 'potion_thunder' } else
        if (randomIndex === 3) { potionType = 'potion_fire' }

  matter.play(potionType)
  matter.setData({
    id,
    interface: 'Bullet',
    builderId,
    damage: randomIndex === 0 ? -5 : randomIndex * -5,
    phaserObject: matter,
    destroy
  })

  scene.time.delayedCall(
    3000,
    () => destroy(),
    null,
    scene
  )

  bulletsRef[id] = { id, update, destroy }
}