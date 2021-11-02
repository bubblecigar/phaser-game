import _ from 'lodash'
import Phaser from 'phaser'
import skins from '../../../skins'
import gameState from '../../../game/state'
import { getLocalUserData } from '../../../user'
import { Player, Monster } from '../../../Interface'
import collisionCategories from '../collisionCategories'

export const createCharactor = (scene, constructor: Player | Monster) => {
  const isUser = constructor.id === getLocalUserData().userId
  const userTeam = gameState.players.find(player => player.id === getLocalUserData().userId).team
  const isMonster = constructor.interface === "Monster"

  const skin = skins[constructor.skin]
  const attributes = constructor.attributes
  const { size, origin } = skin.matterConfig
  const { x, y } = constructor.position

  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  const rect = Bodies.rectangle(x, y, size.width, size.height)
  const compound = Phaser.Physics.Matter.Matter.Body.create({
    parts: [rect],
    inertia: Infinity,
    ignoreGravity: (isUser || isMonster) ? false : true
  })

  const charatorHeight = skin.spritesheetConfig.options.frameHeight
  const healthBarLength = 20
  const maximumBar = scene.add.rectangle(-healthBarLength / 2, -charatorHeight / 2 - 2, healthBarLength, 4, 0xDDDDDD)
  maximumBar.setOrigin(0, 0.5)
  maximumBar.name = 'maximum-bar'
  const allyColor = 0x3f9e34
  const enemyColor = 0xda4e38
  const healthBarColor = constructor.team === userTeam ? allyColor : enemyColor
  const healthBar = scene.add.rectangle(-healthBarLength / 2 + 1, -charatorHeight / 2 - 2, healthBarLength - 2, 2, healthBarColor)
  healthBar.setOrigin(0, 0.5)
  healthBar.name = 'health-bar'
  const maximumHealth = attributes.maxHealth
  if (constructor.health > maximumHealth) {
    constructor.health = maximumHealth
  }
  const percentage = constructor.health / maximumHealth
  healthBar.setSize(percentage * (healthBarLength - 2), healthBar.height)

  const sprite = scene.add.sprite(0, 0)
  sprite.setOrigin(origin.x, origin.y)
  sprite.play(skin.animsConfig.idle.key)
  sprite.name = 'charactor-sprite'

  const container = scene.add.container(x, y, [sprite, maximumBar, healthBar])
  const phaserObject = scene.matter.add.gameObject(container)
  phaserObject.setExistingBody(compound)
  phaserObject.setDepth(3)
  phaserObject.setData(constructor)
  phaserObject.setData({ touched: true, invincible: false })

  if (isMonster) {
    container.setFriction(0, 0, 0)
  }

  let collisionCategory, collisionTargets
  if (constructor.team === 'red') {
    collisionCategory = collisionCategories.CATEGORY_TEAM_RED_PLAYER
    collisionTargets = [
      collisionCategories.CATEGORY_TEAM_BLUE_BULLET,
      collisionCategories.CATEGORY_MOSNTER_BULLET,
      collisionCategories.CATEGORY_ITEM,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  } else if (constructor.team === 'blue') {
    collisionCategory = collisionCategories.CATEGORY_TEAM_BLUE_PLAYER
    collisionTargets = [
      collisionCategories.CATEGORY_TEAM_RED_BULLET,
      collisionCategories.CATEGORY_MOSNTER_BULLET,
      collisionCategories.CATEGORY_ITEM,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  } else {
    collisionCategory = collisionCategories.CATEGORY_MONSTER
    collisionTargets = [
      collisionCategories.CATEGORY_TEAM_RED_BULLET,
      collisionCategories.CATEGORY_TEAM_BLUE_BULLET,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  }
  phaserObject.setCollisionCategory(collisionCategory)
  phaserObject.setCollidesWith(collisionTargets)

  phaserObject.setVelocityY(-1)

  return phaserObject
}

export const setInvincible = (scene, player) => {
  player.phaserObject.setAlpha(0.3)
  player.phaserObject.setData({ invincible: true })
  scene.time.delayedCall(
    100,
    () => {
      try {
        if (player.phaserObject && player.phaserObject.body) {
          player.phaserObject.setAlpha(1)
          player.phaserObject.setData({ invincible: false })
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
  const maximumHealth = player.attributes.maxHealth
  const maxBar = player.phaserObject.getByName('maximum-bar')
  const percentage = player.health / maximumHealth
  const healthBar = player.phaserObject.getByName('health-bar')
  healthBar.setSize(percentage * (maxBar.width - 2), healthBar.height)
}

export const playShootAnimation = (charactor) => {
  const sprite = charactor.phaserObject.getByName('charactor-sprite')
  const skin = skins[charactor.skin]
  const hitConfig = skin.animsConfig.hit
  if (hitConfig) {
    sprite.play({
      key: hitConfig.key,
      repeat: false,
    })
    sprite.once('animationcomplete-' + hitConfig.key, function (currentAnim, currentFrame, sprite) {
      sprite.play(skin.animsConfig.idle.key)
    })
  }
}