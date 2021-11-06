const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const neutrals = require('./neutrals.json')

const getItemDropPossibilityPool = (rarity) => {
  let possibilityPool
  switch (rarity) {
    case 1: {
      possibilityPool = [
        { possibility: 0.80, keys: ['' ]},
        { possibility: 0.90, keys: ['coin' ]},
        { possibility: 1.00, keys: ['potion'] }
      ]
      break
    }
    case 2: {
      possibilityPool = [
        { possibility: 0.50, keys: ['']},
        { possibility: 0.70, keys: ['potion']},
        { possibility: 1.00, keys: ['coin'] }
      ]
      break
    }
    case 3: {
      possibilityPool = [
        { possibility: 0.20, keys: ['potion'] },
        { possibility: 0.80, keys: ['coin'] },
        { possibility: 1.00, keys: ['coin', 'coin'] }
      ]
      break
    }
    case 4: {
      possibilityPool = [
        { possibility: 0.30, keys: ['coin'] },
        { possibility: 0.60, keys: ['coin', 'coin'] },
        { possibility: 0.90, keys: ['coin', 'coin', 'coin'] },
        { possibility: 1.00, keys: ['coin', 'coin', 'coin', 'coin'] }
      ]
      break
    }
    default: {
      possibilityPool = [
        { possibility: 1.00, keys: [] }
      ]
    }
  }
  return possibilityPool
}

const createMonster = (room, spawnLocation, monsterPossibilityPool) => {
  const mapFile = serverMap.processing.map
  const mapUrl = `../share/map/${mapFile}`
  const map = require(mapUrl)
  const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
  const monsterSpawnPoints = infoLayer.objects.filter(object => object.name === spawnLocation)
  const monsterSpawnPoint = monsterSpawnPoints[0]

  const randomNumber1 = Math.random()
  const rolledPool = monsterPossibilityPool.find(p => p.possibility >= randomNumber1)
  const rolledMonsterKey = rolledPool.keys[Math.floor(Math.random() * rolledPool.keys.length)] || 'tinyZombie'
  const rolledMonster = neutrals[rolledMonsterKey]
  const dropPossibilityPool = getItemDropPossibilityPool(rolledPool.itemRarity)
  const randomNumber2 = Math.random()
  const rolledDrop = dropPossibilityPool.find(p => p.possibility >= randomNumber2)

  const monster = {
    interface: 'Monster',
    id: uuid(),
    properties: monsterSpawnPoint.properties,
    builderId: spawnLocation,
    skin: rolledMonster.skin,
    item: rolledMonster.item,
    action: rolledMonster.action,
    attributes: {
      maxHealth: rolledMonster.maxHealth,
      movementSpeed: 1,
      vision: 75,
      healthRegen: 1,
      attackSpeed: 1,
      damage: rolledMonster.damage,
      jump: 1
    },
    team: 'neutral',
    health: rolledMonster.maxHealth,
    itemDrop: rolledDrop.keys,
    expDrop: 3 * rolledPool.itemRarity * rolledPool.itemRarity,
    position: { x: monsterSpawnPoint.x, y: monsterSpawnPoint.y },
    velocity: { x: 0, y: 0 }
  }

  runMonsterScript(room, monster)

  return monster
}

const runMonsterScript = (room, monster) => {
  const shoot = () => {
    const monsterAlive = room.monstersById[monster.id]
    if (!monsterAlive) { return }

    const { player: neareastAlivePlayer, r2: distance } = room.players.reduce(
      (acc, cur) => {
        const alive = cur.health > 0
        if (!alive) { return acc }
        const dx = cur.position.x - monster.position.x
        const dy = cur.position.y - monster.position.y
        const r2 = dx * dx + dy * dy
        return acc.r2 < r2 ? acc : { player: cur, r2 }
      }, { r2: Infinity, player: null }
    )

    if (distance > 10000 || !neareastAlivePlayer) {
      // outside of attcking range
    } else {
      const shootOption = {
        target: neareastAlivePlayer.position,
        performerId: monster.id,
        action: monster.action,
        options: {
          randomNumber: Math.random(),
          damage: monster.attributes.damage,
          item: monster.item
        }
      }
      const { io } = require('./index.js')
      io.in(room.id).emit('dungeon', 'performAction', shootOption)
    }
    setTimeout(() => shoot(), neutrals[monster.skin].shootInterval)
  }
  setTimeout(() => shoot(), neutrals[monster.skin].shootInterval)

  const dx = monster.properties ? monster.properties[0].value : 0
  const centralPosition = { x: monster.position.x, y: monster.position.y }
  const leftPosition = { x: centralPosition.x - dx, y: centralPosition.y }
  const rightPosition = { x: centralPosition.x + dx, y: centralPosition.y }
  const positions = [leftPosition, centralPosition, rightPosition]
  const move = () => {
    const monsterAlive = room.monstersById[monster.id]
    if (!monsterAlive) { return }
    const randomPositionIndex = (Math.floor(Math.random() * 3))
    const randomPosition = positions[randomPositionIndex] || centralPosition
    monster.position = randomPosition
    setTimeout(() => move(), 3000)
  }
  move()
  setTimeout(() => move(), 3000)
}

exports.monsterMethods = {
  createMonster,
  runMonsterScript
}