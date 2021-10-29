export interface Class {
  key: string,
  velocity: number,
  maxHealth: number,
  vision: number
}

const basic: Class = {
  key: 'basic',
  velocity: 2,
  maxHealth: 50,
  vision: 100
}

const scout: Class = {
  key: 'scout',
  velocity: 3,
  maxHealth: 30,
  vision: 100
}

const giant: Class = {
  key: 'giant',
  velocity: 1,
  maxHealth: 100,
  vision: 150
}

export default {
  basic,
  scout,
  giant
}