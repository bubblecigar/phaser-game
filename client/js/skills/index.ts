import Phaser from 'phaser'
import { v4 } from 'uuid'
import _ from 'lodash'
import { Bullet, Player, Point } from '../../../share/game'

export interface ShootConfig {
  bulletKey: string,
  bulletDamage: number,
  bulletDuration: number,
  bulletAngularVelocity: number,
  bulletSpeedModifier: number,
  directions: {
    front: boolean,
    back: boolean,
    side: boolean,
    frontDiagnals: boolean,
    backDiagnals: boolean
  }
}

export const createBulletsOfOneShot = (player: Player, aim: Point, ShootConfig: ShootConfig) => {
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

export interface Skills {

}