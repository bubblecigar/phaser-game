import _ from 'lodash'
import Phaser from 'phaser'
import charactors from '../../../charactors'
import { getLocalUserData } from '../../../user'
import { Player, Monster } from '../../../Interface'
import collisionCategories from '../collisionCategories'

export const createCharactor = (scene, constructor: Player | Monster) => {
  const isUser = constructor.id === getLocalUserData().userId
  const isMonster = constructor.interface === "Monster"

  const charactor = charactors[constructor.charactorKey]
  const { size, origin } = charactor.matterConfig
  const { x, y } = constructor.position

  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(x, y, size.width, size.height)
  const compound = Phaser.Physics.Matter.Matter.Body.create({
    parts: [rect],
    inertia: Infinity,
    ignoreGravity: (isUser || isMonster) ? false : true
  })

  const charatorHeight = charactor.spritesheetConfig.options.frameHeight
  const healthBarLength = 20
  const maximumBar = scene.add.rectangle(-healthBarLength / 2, -charatorHeight / 2 - 2, healthBarLength, 4, 0xDDDDDD)
  maximumBar.setOrigin(0, 0.5)
  maximumBar.name = 'maximum-bar'
  const healthBar = scene.add.rectangle(-healthBarLength / 2 + 1, -charatorHeight / 2 - 2, healthBarLength - 2, 2, 0xda4e38)
  healthBar.setOrigin(0, 0.5)
  healthBar.name = 'health-bar'
  const maximumHealth = charactor.maxHealth
  if (constructor.health > maximumHealth) {
    constructor.health = maximumHealth
  }
  const percentage = constructor.health / maximumHealth
  healthBar.setSize(percentage * (healthBarLength - 2), healthBar.height)

  const sprite = scene.add.sprite(0, 0)
  sprite.setOrigin(origin.x, origin.y)
  sprite.play(charactor.animsConfig.idle.key)
  sprite.name = 'charactor-sprite'

  const container = scene.add.container(x, y, [sprite, maximumBar, healthBar])
  const phaserObject = scene.matter.add.gameObject(container)
  phaserObject.setExistingBody(compound)
  phaserObject.setDepth(3)
  phaserObject.setData(constructor)
  phaserObject.setData({ touched: true })

  const collisionCategory = isMonster
    ? collisionCategories.CATEGORY_MONSTER
    : collisionCategories.CATEGORY_PLAYER
  phaserObject.setCollisionCategory(collisionCategory)
  const collideTargets = isMonster ? [
    collisionCategories.CATEGORY_PLAYER_BULLET,
    collisionCategories.CATEGORY_ENEMY_BULLET,
    collisionCategories.CATEGORY_MAP_BLOCK
  ] : (
    isUser ? [
      collisionCategories.CATEGORY_ENEMY_BULLET,
      collisionCategories.CATEGORY_ITEM,
      collisionCategories.CATEGORY_MAP_BLOCK
    ] : [
      collisionCategories.CATEGORY_PLAYER_BULLET,
      collisionCategories.CATEGORY_ITEM,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  )
  phaserObject.setCollidesWith(collideTargets)
  if (constructor.health <= 0) {
    phaserObject.setCollisionCategory(collisionCategories.CATEGORY_TRANSPARENT)
    phaserObject.setCollidesWith([collisionCategories.CATEGORY_MAP_BLOCK])
  }

  return phaserObject
}

export const setInvincible = (scene, player) => {
  const originCollisionCategory = player.phaserObject.body.collisionFilter.category
  player.phaserObject.setCollisionCategory(collisionCategories.CATEGORY_TRANSPARENT)
  player.phaserObject.setAlpha(0.3)
  scene.time.delayedCall(
    500,
    () => {
      try {
        if (player.phaserObject && player.phaserObject.body) {
          player.phaserObject.setAlpha(1)
          player.phaserObject.setCollisionCategory(originCollisionCategory)
        }
      } catch (error) {
        console.log(error)
      }
    },
    null,
    scene
  )
}

export const updatePlayerHealthBar = player => {
  const maximumHealth = charactors[player.charactorKey].maxHealth
  const maxBar = player.phaserObject.getByName('maximum-bar')
  const percentage = player.health / maximumHealth
  const healthBar = player.phaserObject.getByName('health-bar')
  healthBar.setSize(percentage * (maxBar.width - 2), healthBar.height)
}