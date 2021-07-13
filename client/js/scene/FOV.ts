import Phaser from 'phaser'
import _ from 'lodash'
import { gameConfig } from '../../../share/game'
import { MapConfig } from './dungeon'

let graphics

const setUpMap = (scene, key) => {
  const map = scene.make.tilemap({ key })
  scene.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  return map
}
const setUpTileset = (map, key) => {
  const tileset = map.addTilesetImage(key)
  return tileset
}
const setUpLayer = (map, tileset) => {
  const layers = []
  map.layers.forEach(layer => {
    const l = map.createLayer(layer.name, tileset, 0, 0)
    l.name = layer.name
    l.setCollisionFromCollisionGroup()
    map.scene.matter.world.convertTilemapLayer(l)
    layers.push(l)
  })
  return layers
}

const setUpFOVmask = (scene, map) => {
  scene.raycaster = scene.raycasterPlugin.createRaycaster()
  scene.ray = scene.raycaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    }
  })

  const fov_layer = map.objects.find(o => o.name === 'fov_layer')
  const fovObjects = []
  if (fov_layer && fov_layer.objects) {
    fov_layer.objects.forEach(
      object => {
        if (object.polygon) {
          const polygon = scene.add.polygon(object.x, object.y, object.polygon)
          polygon.setOrigin(0, 0)
          fovObjects.push(polygon)

          const sensor = scene.matter.add.fromVertices(object.x, object.y, object.polygon, { isSensor: true, isStatic: true })
          scene.matter.alignBody(sensor, object.x, object.y, Phaser.Display.Align.TOP_LEFT)
          const nullGameObject = new Phaser.GameObjects.GameObject(scene, 'null')
          const sensorGameObj = scene.matter.add.gameObject(nullGameObject, sensor)
          sensorGameObj.setData({ interface: 'fov-sensor' })
        } else if (object.rectangle) {
          const { x, y, width, height } = object
          const rect = scene.add.rectangle(x, y, width, height)
          rect.setOrigin(0, 0)
          fovObjects.push(rect)
        }
      }
    )
  }
  scene.raycaster.mapGameObjects(fovObjects)

  graphics = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.1 } })
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
  mask.setInvertAlpha()
  return mask
}

const setUpBackgroundRenderer = (scene, mask, map, layers) => {
  const renderTexture = scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
  renderTexture.setDepth(10)
  renderTexture.setMask(mask);
  renderTexture.clear()
  renderTexture.fill('#000000', 1)
  renderTexture.setTint(0x666666)
  renderTexture.draw(layers)
  return renderTexture
}

const createBackground = (scene, config: MapConfig) => {
  const { mapKey, tilesetKey } = config
  const map = setUpMap(scene, mapKey)
  const tileset = setUpTileset(map, tilesetKey)
  const layers = setUpLayer(map, tileset)
  const mask = setUpFOVmask(scene, map)
  setUpBackgroundRenderer(scene, mask, map, layers)
  return map
}

const updateBackground = (scene, position) => {
  scene.ray.setOrigin(position.x, position.y)
  const intersections = scene.ray.castCircle()
  graphics.clear()
  graphics.fillPoints(intersections)
}

const FOV = {
  create: createBackground,
  update: updateBackground
}

export default FOV