
export interface Point {
  x: number,
  y: number
}

export interface Abilities {
  doubleDamage?: boolean,
  bulletDuration?: boolean,
  bulletSpeed?: boolean,
  bulletRotate?: boolean,
  backShooting?: boolean,
  sideShooting?: boolean,
  frontSplit?: boolean,
  backSplit?: boolean,
  consectiveShooting?: number
}

export interface Player {
  interface: 'Player',
  id: string,
  velocity: Point,
  position: Point,
  charactorKey: string,
  phaserObject: any,
  health: number,
  items: Item[],
  bullet: string,
  abilities: Abilities,
  coins: number
}
export interface Item {
  interface: 'Item',
  id: string,
  itemKey: string,
  position: Point,
  velocity: Point,
  phaserObject: any
}
export interface Bullet extends Omit<Item, 'interface'> {
  interface: 'Bullet',
  builderId: string,
  damage: number,
  angularVelocity: number,
  duration: number
}
export interface GameState {
  mapConfigKey: String,
  players: Player[],
  items: Item[]
}