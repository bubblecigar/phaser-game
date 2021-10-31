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
  }
}

export const skinLevelConstraint = {
  "tinyZombie": 0,
  "imp": 0,
  "skeleton": 0,
  "wizzardMale": 5,
  "knightFemale": 5,
  "elfFemale": 5,
  "elfMale": 5,
  "lizardFemale": 8,
  "chort": 8,
  "orge": 12,
  "giantDemon": 12,
  "giantZombie": 12,
}

export const createSkinPool = (level) => {
  return Object.keys(skinLevelConstraint).filter(
    skin => level >= skinLevelConstraint[skin]
  )
}

export const skinAttributeConstraint = {
  "tinyZombie": ['maxhealth1'],
  "imp": ['maxhealth1'],
  "skeleton": ['maxhealth1'],
  "wizzardMale": ['maxhealth1'],
  "knightFemale": ['maxhealth3'],
  "elfFemale": ['maxhealth1', 'vision3'],
  "elfMale": ['maxhealth1', 'vision3'],
  "lizardFemale": ['maxhealth1', 'movementSpeed'],
  "chort": ['maxhealth1', 'movementSpeed'],
  "orge": ['maxhealth3', 'vision1'],
  "giantDemon": ['maxhealth3', 'vision1'],
  "giantZombie": ['maxhealth3', 'vision1']
}

export const createAttributePool = (skin) => {
  return skinAttributeConstraint[skin].map(
    attr => availableAttributes[attr]
  )
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

export const createActionPool = (skin, item) => {
  const availableSkinActions = skinActionConstraint[skin]
  const availableItemActions = itemActionConstraint[item]
  return _.intersection(availableSkinActions, availableItemActions)
}

export const createItemPool = (skin, action) => {
  const availableSkinItem = skinItemConstraint[skin]
  const availableActionItem = actionItemConstraint[action]
  return _.intersection(availableSkinItem, availableActionItem)
}
