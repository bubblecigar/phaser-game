const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')

const createMonster = () => {
  const mapFile = serverMap.processing.map
  const mapUrl = `../share/map/${mapFile}`
  const map = require(mapUrl)
  const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
  const monsterSpawnPoints = infoLayer.objects.filter(object => object.name === 'monster_point')
  const randomMonsterSpawnIndex = Math.floor(Math.random() * (monsterSpawnPoints.length))
  const monsterSpawnPoint = monsterSpawnPoints[randomMonsterSpawnIndex]
  const monsterConstructor = {
    interface: 'Monster',
    id: uuid(),
    health: 100,
    properties: monsterSpawnPoint.properties,
    builderId: 'server',
    charactorKey: 'orge',
    drop: 'coin',
    position: { x: monsterSpawnPoint.x, y: monsterSpawnPoint.y },
    velocity: { x: 0, y: 0 }
  }
  return monsterConstructor
}

const runMonsterScript = (room, monster) => {
  const shoot = () => {
    const monsterAlive = room.monsters.find(m => m.id === monster.id)
    if (!monsterAlive) { return }
    const shootType = 'soundwave'
    const shootOption = {
      from: monster.position,
      to: { x: monster.position.x + 10, y: monster.position.y },
      builderId: monster.id,
      type: shootType,
      options: {
        type: shootType,
        randomNumber: Math.random()
      }
    }
    const { io } = require('./index.js')
    io.in(room.id).emit('dungeon', 'shoot', shootOption)
    setTimeout(() => shoot(), 3000)
  }
  setTimeout(() => shoot(), 3000)

  const dx = monster.properties ? monster.properties[0].value : 0
  const centralPosition = { x: monster.position.x, y: monster.position.y }
  const leftPosition = { x: centralPosition.x - dx, y: centralPosition.y }
  const rightPosition = { x: centralPosition.x + dx, y: centralPosition.y }
  const positions = [leftPosition, centralPosition, rightPosition]
  const move = () => {
    const monsterAlive = room.monsters.find(m => m.id === monster.id)
    if (!monsterAlive) { return }
    const randomPositionIndex = (Math.floor(Math.random() * 3))
    const randomPosition = positions[randomPositionIndex] || centralPosition
    monster.position = randomPosition
    setTimeout(() => move(), 2000)
  }
  move()
  setTimeout(() => move(), 2000)
}


exports.monsterMethods = {
  createMonster,
  runMonsterScript
}