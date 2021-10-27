const uuid = require('uuid')
const setting = require('../share/setting.json')
const serverMap = require('../share/serverMap.json')
const neutrals = require('./neutrals.json')

const createMonster = () => {
  const mapFile = serverMap.processing.map
  const mapUrl = `../share/map/${mapFile}`
  const map = require(mapUrl)
  const infoLayer = map.layers.find(layer => layer.name === 'info_layer')
  const monsterSpawnPoints = infoLayer.objects.filter(object => object.name === 'monster_point')
  const randomMonsterSpawnIndex = Math.floor(Math.random() * (monsterSpawnPoints.length))
  const monsterSpawnPoint = monsterSpawnPoints[randomMonsterSpawnIndex]
  const monsterKeys = Object.keys(neutrals)
  const randomMonsterKey = monsterKeys[Math.floor(Math.random() * (monsterKeys.length))]
  const randomMonster = neutrals[randomMonsterKey]
  const monsterConstructor = {
    interface: 'Monster',
    id: uuid(),
    properties: monsterSpawnPoint.properties,
    builderId: 'server',
    charactorKey: randomMonster.key,
    health: randomMonster.health,
    drop: 'coin',
    position: { x: monsterSpawnPoint.x, y: monsterSpawnPoint.y },
    velocity: { x: 0, y: 0 }
  }
  return monsterConstructor
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
        from: monster.position,
        to: neareastAlivePlayer.position,
        builderId: monster.id,
        type: neutrals[monster.charactorKey].shootType,
        options: {
          type: neutrals[monster.charactorKey].shootType,
          randomNumber: Math.random()
        }
      }
      const { io } = require('./index.js')
      io.in(room.id).emit('dungeon', 'shoot', shootOption)
    }
    setTimeout(() => shoot(), neutrals[monster.charactorKey].shootInterval)
  }
  setTimeout(() => shoot(), neutrals[monster.charactorKey].shootInterval)

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