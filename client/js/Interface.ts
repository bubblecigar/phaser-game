
export interface Point {
  x: number,
  y: number
}

export interface Abilities {
  damageMultiplier: number,
  durationMultiplier: number,
  speedMultiplier: number,
  rotation: boolean,
  directions: number[],
  consectiveShooting: number
}

export interface Player {
  interface: 'Player',
  id: string,
  velocity: Point,
  position: Point,
  charactorKey: string,
  ready: boolean,
  scene: string,
  phaserObject: any,
  health: number,
  items: Item[],
  bullet: string,
  abilities: Abilities,
  coins: number,
  resurrectCountDown: number
}
export interface Monster {
  interface: 'Monster',
  id: string,
  velocity: Point,
  position: Point,
  charactorKey: string,
  phaserObject: any,
  health: number
}
export interface Item {
  interface: 'Item',
  id: string,
  builderId: string,
  itemKey: string,
  position: Point,
  velocity: Point,
  phaserObject: any
}
export interface Sensor {
  interface: 'Sensor',
  name: string,
  phaserObject: any
}
export interface Bullet extends Omit<Item, 'interface'> {
  interface: 'Bullet',
  damage: number,
  angularVelocity: number,
  duration: number
}
export interface GameState {
  players: Player[],
  items: Item[],
  gameStatus: 'waiting' | 'processing' | 'ending',
  winner: null | Player
}