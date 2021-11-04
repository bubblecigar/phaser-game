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
  healthRegen1: {
    property: 'healthRegen',
    value: 0.3
  },
  healthRegen2: {
    property: 'healthRegen',
    value: 0.7
  },
  healthRegen3: {
    property: 'healthRegen',
    value: 1
  },
  attackSpeed1: {
    property: 'attackSpeed',
    value: 0.1
  },
  attackSpeed2: {
    property: 'attackSpeed',
    value: 0.2
  },
  attackSpeed3: {
    property: 'attackSpeed',
    value: 0.4
  },
  damage1: {
    property: 'damage',
    value: 0.1
  },
  damage2: {
    property: 'damage',
    value: 0.2
  },
  damage3: {
    property: 'damage',
    value: 0.3
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
  "tinyZombie": ['maxhealth1', 'vision1'],
  "imp": ['vision1', 'healthRegen1'],
  "skeleton": ['healthRegen1', 'maxhealth1'],
  "wizzardMale": ['damage1', 'damage2', 'damage3'],
  "knightFemale": ['damage1', 'healthRegen3', 'maxhealth3'],
  "elfFemale": ['damage1', 'vision3'],
  "elfMale": ['damage1', 'vision3'],
  "lizardFemale": ['damage1', 'attackSpeed1', 'attackSpeed2', 'movementSpeed'],
  "chort": ['damage1', 'attackSpeed1', 'attackSpeed2', 'jump'],
  "orge": ['vision3', 'maxhealth3', 'healthRegen3', 'damage3', 'attackSpeed3'],
  "giantDemon": ['vision3', 'maxhealth3', 'healthRegen3', 'damage3', 'attackSpeed3'],
  "giantZombie": ['vision3', 'maxhealth3', 'healthRegen3', 'damage3', 'attackSpeed3']
}

export const itemAttributeConstraint = {
  dagger: ['attackSpeed1', 'damage1'],
  coin: ['attackSpeed3'],
  iceFlask: ['attackSpeed2'],
  shadowBall: ['damage3'],
  fireball: ['damage2'],
  arrow: ['damage2'],
  potion: ['damage2', 'healthRegen2'],
  muddy: ['damage2', 'vision2']
}

export const createAttributePool = (player) => {
  const skinAttributePool = skinAttributeConstraint[player.skin].map(
    attr => availableAttributes[attr]
  )
  const itemAttributePool = itemAttributeConstraint[player.item].map(
    attr => availableAttributes[attr]
  )
  let availAttributePool = _.unionBy(skinAttributePool, itemAttributePool, attr => `${attr.property}-${attr.value}`)

  if (player.attributes.movementSpeed >= 3) {
    availAttributePool = availAttributePool.filter(a => a.property !== 'movementSpeed')
  }
  if (player.attributes.jump >= 3) {
    availAttributePool = availAttributePool.filter(a => a.property !== 'jump')
  }
  if (player.attributes.attackSpeed >= 3) {
    availAttributePool = availAttributePool.filter(a => a.property !== 'attackSpeed')
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
