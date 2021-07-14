export interface Skills {
  bulletDamage: number,
  bulletDuration: number,
  bulletAngularVelocity: number,
  bulletSpeedModifier: number,
  consectiveShoot: number,
  directions: {
    front: boolean,
    back: boolean,
    side: boolean,
    frontDiagnals: boolean,
    backDiagnals: boolean
  }
}