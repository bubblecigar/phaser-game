import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { Bullet, Player, Point, Abilities } from '../Interface'
import { broadcast } from '../socket'

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

export const createBulletsOfOneShot = (player: Player, aim: Point, ShootConfig: ShootConfig): Bullet[] => {
  const dx = aim.x - player.position.x
  const dy = aim.y - player.position.y
  const l = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / l
  const ny = dy / l

  const createBullet = (ShootConfig: ShootConfig): Bullet => ({
    interface: 'Bullet',
    builderId: player.id,
    id: v4(),
    itemKey: ShootConfig.bulletKey,
    damage: ShootConfig.bulletDamage,
    position: player.position,
    velocity: { x: nx * ShootConfig.bulletSpeedModifier, y: ny * ShootConfig.bulletSpeedModifier },
    angularVelocity: ShootConfig.bulletAngularVelocity,
    duration: ShootConfig.bulletDuration,
    phaserObject: null
  })

  const bullets = []
  ShootConfig.directions.forEach(
    direction => {
      const bullet = createBullet(ShootConfig)
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

export const castSkill = (player: Player, skill: Skill, aim: Point, scene, methods) => {
  const shotConfig: ShootConfig = skill.shotConfigs.shift()
  if (!shotConfig) return

  const bullets = createBulletsOfOneShot(player, aim, shotConfig)
  broadcast(methods, 'shootInClient', bullets)

  if (skill.shotConfigs.length <= 0) return

  const nextShotInterval = skill.shotIntervals.shift() || 200
  scene.time.delayedCall(
    nextShotInterval,
    () => {
      castSkill(player, skill, aim, scene, methods)
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

  return {
    shotConfigs,
    shotIntervals,
    castTime: 200
  }
}