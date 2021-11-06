
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

export interface Charactor {
  id: string,
  name: string,
  velocity: Point,
  position: Point,
  skin: string,
  action: string,
  item: string,
  attributes: {
    maxHealth: number,
    vision: number,
    movementSpeed: number,
    healthRegen: number,
    attackSpeed: number,
    damage: number,
    jump: number
  },
  team: 'red' | 'blue' | 'neutral',
  phaserObject: any,
  health: number,
}

export interface Player extends Omit<Charactor, 'interface'> {
  interface: 'Player',
  ready: boolean,
  name: string,
  scene: string,
  phaserObject: any,
  coins: number,
  exp: number,
  level: number,
  resurrectCountDown: number
}
export interface Monster extends Omit<Charactor, 'interface'> {
  interface: 'Monster',
  itemDrop: string[],
  expDrop: number,
  phaserObject: any
}
export interface Item {
  interface: 'Item',
  id: string,
  builderId: string,
  itemKey: string,
  position: Point,
  velocity: Point,
  phaserObject: any
  type?: string,
  isDrop: boolean
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
  winners: null | Player[],
  gameStartCountDown: number
}