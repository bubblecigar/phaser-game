import _ from 'lodash'

const availableAttributes = {
  maxhealth1: {
    property: 'maxHealth',
    value: 5
  },
  maxhealth2: {
    property: 'maxHealth',
    value: 10
  },
  maxhealth3: {
    property: 'maxHealth',
    value: 15
  },
  movementSpeed: {
    property: 'movementSpeed',
    value: 1
  },
  vision1: {
    property: 'vision',
    value: 5
  },
  vision2: {
    property: 'vision',
    value: 10
  },
  vision3: {
    property: 'vision',
    value: 15
  },
  healthRegen: {
    property: 'healthRegen',
    value: 1
  },
  attackSpeed: {
    property: 'attackSpeed',
    value: 1
  },
  damage1: {
    property: 'damage',
    value: 1
  },
  damage2: {
    property: 'damage',
    value: 2
  },
  damage3: {
    property: 'damage',
    value: 3
  },
  jump: {
    property: 'jump',
    value: 1
  }
}

export const skinLevelConstraint = {
  "tinyZombie": 0,
  "imp": 0,
  "skeleton": 0,
  "wizzardMale": 3,
  "knightFemale": 3,
  "elfFemale": 3,
  "elfMale": 3,
  "lizardFemale": 5,
  "chort": 5,
  "orge": 8,
  "giantDemon": 8,
  "giantZombie": 8,
}

export const createSkinPool = (level, equippedSkin) => {
  return Object.keys(skinLevelConstraint).filter(
    skin => level >= skinLevelConstraint[skin] && skin !== equippedSkin
  )
}

export const skinAttributeConstraint = {
  "tinyZombie": ['maxhealth1'],
  "imp": ['vision1'],
  "skeleton": ['damage1'],
  "wizzardMale": ['maxhealth1', 'damage1', 'vision1', 'attackSpeed'],
  "knightFemale": ['healthRegen', 'maxhealth3', 'damage1'],
  "elfFemale": ['vision3', 'maxhealth1', 'damage2'],
  "elfMale": ['vision3', 'maxhealth1', 'damage2'],
  "lizardFemale": ['movementSpeed', 'maxhealth1', 'damage1'],
  "chort": ['jump', 'maxhealth1', 'damage1'],
  "orge": ['vision1', 'maxhealth1', 'damage1', 'vision2', 'maxhealth2', 'damage2', 'vision3', 'maxhealth3', 'damage3', 'jump'],
  "giantDemon": ['vision1', 'maxhealth1', 'damage1', 'vision2', 'maxhealth2', 'damage2', 'vision3', 'maxhealth3', 'damage3'],
  "giantZombie": ['vision1', 'maxhealth1', 'damage1', 'vision2', 'maxhealth2', 'damage2', 'vision3', 'maxhealth3', 'damage3']
}

export const createAttributePool = (player) => {
  let availAttributePool = skinAttributeConstraint[player.skin].map(
    attr => availableAttributes[attr]
  )
  if (player.attributes.movementSpeed >= 3) {
    availAttributePool = availAttributePool.filter(a => a.property !== 'movementSpeed')
  }
  if (player.attributes.jump >= 3) {
    availAttributePool = availAttributePool.filter(a => a.property !== 'jump')
  }
  return availAttributePool
}

export const skinActionConstraint = {
  "tinyZombie": ['tab'],
  "imp": ['tab'],
  "skeleton": ['tab'],
  "wizzardMale": ['tab', 'rain', 'shoot'],
  "knightFemale": ['tab'],
  "elfFemale": ['tab', 'throws'],
  "elfMale": ['tab', 'throws'],
  "lizardFemale": ['tab', 'spin'],
  "chort": ['tab', 'shoot'],
  "orge": ['tab', 'throws', 'shoot'],
  "giantDemon": ['tab', 'rain', 'shoot', 'throws'],
  "giantZombie": ['tab', 'summon', 'throws']
}

export const skinItemConstraint = {
  tinyZombie: ['dagger'],
  imp: ['dagger'],
  skeleton: ['dagger'],
  wizzardMale: ['fireball', 'iceFlask'],
  knightFemale: ['dagger'],
  elfFemale: ['dagger', 'arrow'],
  elfMale: ['dagger', 'arrow'],
  lizardFemale: ['dagger', 'coin'],
  chort: ['coin', 'potion'],
  orge: ['dagger', 'arrow', 'potion'],
  giantDemon: ['dagger', 'fireball', 'shadowBall'],
  giantZombie: ['dagger', 'muddy', 'potion']
}

export const actionItemConstraint = {
  rain: ['coin', 'iceFlask', 'shadowBall', 'dagger'],
  shoot: ['iceFlask', 'shadowBall', 'coin', 'fireball', 'arrow', 'dagger'],
  spin: ['coin', 'iceFlask', 'dagger', 'shadowBall', 'potion'],
  summon: ['muddy', 'coin', 'iceFlask', 'shadowBall'],
  tab: ['iceFlask', 'shadowBall', 'coin', 'fireball', 'dagger'],
  throws: ['iceFlask', 'shadowBall', 'coin', 'fireball', 'dagger', 'potion', 'arrow', 'muddy']
}

export const itemActionConstraint = {
  iceFlask: ['rain', 'shoot', 'spin', 'summon', 'tab', 'throws'],
  shadowBall: ['rain', 'shoot', 'spin', 'summon', 'tab', 'throws'],
  coin: ['rain', 'shoot', 'spin', 'summon', 'tab', 'throws'],
  fireball: ['shoot', 'tab', 'throws'],
  dagger: ['rain', 'shoot', 'spin', 'tab', 'throws'],
  potion: ['spin', 'throws'],
  arrow: ['shoot', 'throws'],
  muddy: ['summon', 'throws']
}

export const createActionPool = (skin, item, equippedAction) => {
  const availableSkinActions = skinActionConstraint[skin]
  const availableItemActions = itemActionConstraint[item]
  return _.intersection(availableSkinActions, availableItemActions).filter(action => action !== equippedAction)
}

export const createItemPool = (skin, action, equippedItem) => {
  const availableSkinItem = skinItemConstraint[skin]
  const availableActionItem = actionItemConstraint[action]
  return _.intersection(availableSkinItem, availableActionItem).filter(item => item !== equippedItem)
}
