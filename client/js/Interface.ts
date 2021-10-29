
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
  name: string,
  velocity: Point,
  position: Point,
  skin: string,
  unit: string,
  action: string,
  item: string,
  ready: boolean,
  scene: string,
  phaserObject: any,
  health: number,
  coins: number,
  resurrectCountDown: number
}
export interface Monster {
  interface: 'Monster',
  id: string,
  velocity: Point,
  position: Point,
  skin: string,
  unit: string,
  drop: string,
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
  type?: string
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
  monstersById: any,
  gameStatus: 'waiting' | 'processing' | 'ending',
  scene: 'loginScene',
  winner: null | Player,
  gameStartCountDown: number
}