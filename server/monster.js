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
    builderId: 'server',
    charactorKey: 'orge',
    drop: 'coin',
    position: { x: monsterSpawnPoint.x, y: monsterSpawnPoint.y },
    velocity: { x: 0, y: 0 }
  }
  return monsterConstructor
}


exports.monsterMethods = {
  createMonster
}