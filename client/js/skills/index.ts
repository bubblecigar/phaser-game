import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { Bullet, Player, Point, Abilities } from '../Interface'

export interface ShootConfig {
  bulletKey: string,
  bulletDamage: number,
  bulletDuration: number,
  bulletAngularVelocity: number,
  bulletSpeedModifier: number,
  directions: number[]
}

const createBaseShotConfig = (bullet: string): ShootConfig => ({
  bulletKey: bullet,
  bulletDamage: 3,
  bulletDuration: 700,
  bulletSpeedModifier: 1,
  bulletAngularVelocity: 0,
  directions: [0]
})

export const createBulletsOfOneShot = (player: Player, aim: Point, shootConfig: ShootConfig): Bullet[] => {
  const dx = aim.x - player.position.x
  const dy = aim.y - player.position.y
  const l = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / l
  const ny = dy / l

  const createBullet = (shootConfig: ShootConfig): Bullet => ({
    interface: 'Bullet',
    builderId: player.id,
    id: v4(),
    itemKey: shootConfig.bulletKey,
    damage: shootConfig.bulletDamage,
    position: player.position,
    velocity: { x: nx * shootConfig.bulletSpeedModifier, y: ny * shootConfig.bulletSpeedModifier },
    angularVelocity: shootConfig.bulletAngularVelocity,
    duration: shootConfig.bulletDuration,
    phaserObject: null
  })

  const bullets = []

  player.abilities.directions.forEach(
    direction => {
      const bullet = createBullet(shootConfig)
      bullet.velocity = new Phaser.Math.Vector2(bullet.velocity.x, bullet.velocity.y).rotate(direction)
      bullets.push(bullet)
    }
  )

  return bullets
}

export interface Skill {
  shotConfigs: ShootConfig[],
  shotIntervals: number[],
  castTime: number
}

export const castSkill = (player: Player, skill: Skill, aim: Point, scene, methods, socketMethods) => {
  const shotConfig: ShootConfig = skill.shotConfigs.shift()
  if (!shotConfig) return

  const bullets = createBulletsOfOneShot(player, aim, shotConfig)
  socketMethods.broadcast(methods, 'shootInClient', bullets)

  if (skill.shotConfigs.length <= 0) return

  const nextShotInterval = skill.shotIntervals.shift() || 200
  scene.time.delayedCall(
    nextShotInterval,
    () => {
      castSkill(player, skill, aim, scene, methods, socketMethods)
    },
    null,
    scene
  )
}

export const createInitAbilities = (): Abilities => ({
  damageMultiplier: 1,
  durationMultiplier: 1,
  speedMultiplier: 1,
  rotation: false,
  directions: [0],
  consectiveShooting: 1
})


export const createSkill = (bullet: string, abilities: Abilities): Skill => {
  const baseShotConfig = createBaseShotConfig(bullet)
  baseShotConfig.bulletKey = bullet
  baseShotConfig.bulletDamage *= abilities.damageMultiplier
  baseShotConfig.bulletDuration *= abilities.durationMultiplier
  baseShotConfig.bulletSpeedModifier *= abilities.speedMultiplier
  baseShotConfig.bulletAngularVelocity = abilities.rotation ? 0.15 : 0

  const shotConfigs = []
  const shotIntervals = []
  const waves = abilities.consectiveShooting || 1
  for (let i = 0; i < waves; i++) {
    shotConfigs.push(_.clone(baseShotConfig))
    shotIntervals.push(300 + i * 100)
  }

  const castTime = (1 + (abilities.damageMultiplier - 1) + (abilities.durationMultiplier - 1) + (abilities.speedMultiplier - 1)) * Math.sqrt(abilities.consectiveShooting) * Math.sqrt(abilities.directions.length / 2) * 100

  return {
    shotConfigs,
    shotIntervals,
    castTime
  }
}