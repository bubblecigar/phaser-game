import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { Bullet, Player, Point, Abilities } from '../../../share/game'
import socket from '../socket'

interface Directions {
  front: boolean,
  back: boolean,
  side: boolean,
  frontDiagnals: boolean,
  backDiagnals: boolean
}

export interface ShootConfig {
  bulletKey: string,
  bulletDamage: number,
  bulletDuration: number,
  bulletAngularVelocity: number,
  bulletSpeedModifier: number,
  directions: Directions
}

const createBaseShotConfig = () => ({
  bulletKey: 'dagger',
  bulletDamage: 3,
  bulletDuration: 1000,
  bulletSpeedModifier: 1,
  bulletAngularVelocity: 0,
  directions: {
    front: true,
    back: false,
    side: false,
    frontDiagnals: false,
    backDiagnals: false
  }
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
  const directions = ShootConfig.directions
  if (directions.front) {
    const bullet = createBullet(ShootConfig)
    bullets.push(bullet)
  }
  if (directions.back) {
    const bullet = createBullet(ShootConfig)
    bullet.velocity = new Phaser.Math.Vector2(bullet.velocity.x, bullet.velocity.y).rotate(Math.PI)
    bullets.push(bullet)
  }
  if (directions.side) {
    const bulletR = createBullet(ShootConfig)
    bulletR.velocity = new Phaser.Math.Vector2(bulletR.velocity.x, bulletR.velocity.y).rotate(Math.PI / 2)
    bullets.push(bulletR)
    const bulletL = createBullet(ShootConfig)
    bulletL.velocity = new Phaser.Math.Vector2(bulletL.velocity.x, bulletL.velocity.y).rotate(-Math.PI / 2)
    bullets.push(bulletL)
  }
  if (directions.frontDiagnals) {
    const bulletR = createBullet(ShootConfig)
    bulletR.velocity = new Phaser.Math.Vector2(bulletR.velocity.x, bulletR.velocity.y).rotate(Math.PI / 4)
    bullets.push(bulletR)
    const bulletL = createBullet(ShootConfig)
    bulletL.velocity = new Phaser.Math.Vector2(bulletL.velocity.x, bulletL.velocity.y).rotate(-Math.PI / 4)
    bullets.push(bulletL)
  }
  if (directions.backDiagnals) {
    const bulletR = createBullet(ShootConfig)
    bulletR.velocity = new Phaser.Math.Vector2(bulletR.velocity.x, bulletR.velocity.y).rotate(Math.PI * 3 / 4)
    bullets.push(bulletR)
    const bulletL = createBullet(ShootConfig)
    bulletL.velocity = new Phaser.Math.Vector2(bulletL.velocity.x, bulletL.velocity.y).rotate(-Math.PI * 3 / 4)
    bullets.push(bulletL)
  }

  return bullets
}

export interface Skill {
  shotConfigs: ShootConfig[],
  shotIntervals: number[],
  coolDown: number,
  castTime: number
}

export const castSkill = (player: Player, skill: Skill, aim: Point, scene, methods) => {
  const shotConfig: ShootConfig = skill.shotConfigs.shift()
  if (!shotConfig) return

  const bullets = createBulletsOfOneShot(player, aim, shotConfig)
  methods.shootInClient(bullets)
  socket.emit('shootInClient', bullets)

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


export const createSkill = (weapon: string, abilities: Abilities): Skill => {
  const baseShotConfig = createBaseShotConfig()
  baseShotConfig.bulletKey = weapon
  if (abilities.doubleDamage) { baseShotConfig.bulletDamage *= 2 }
  if (abilities.bulletDuration) { baseShotConfig.bulletDuration *= 2 }
  if (abilities.bulletSpeed) { baseShotConfig.bulletSpeedModifier = 1.3 }
  if (abilities.bulletRotate) { baseShotConfig.bulletAngularVelocity = 0.2 }
  if (abilities.backShooting) { baseShotConfig.directions.back = true }
  if (abilities.frontSplit) { baseShotConfig.directions.frontDiagnals = true }
  if (abilities.sideShooting) { baseShotConfig.directions.side = true }
  if (abilities.backSplit) { baseShotConfig.directions.backDiagnals = true }

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
    coolDown: 3000,
    castTime: 1000
  }
}