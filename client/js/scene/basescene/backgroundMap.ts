import Phaser from 'phaser'
import _ from 'lodash'
import gameConfig from '../../game/config'
import setting from '../../../../share/setting.json'
import { Sensor } from '../../Interface'

const setUpMap = (scene, key) => {
  const map = scene.make.tilemap({ key })
  scene.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
  const wallLabel = 'world-bound-wall'
  scene.matter.world.walls.left.label = wallLabel
  scene.matter.world.walls.right.label = wallLabel
  scene.matter.world.walls.top.label = wallLabel
  scene.matter.world.walls.bottom.label = wallLabel
  return map
}
const setUpTileset = (scene, key) => {
  const tileset = scene.map.addTilesetImage(key)
  return tileset
}
const setUpTileLayers = (scene, tileset) => {
  const map = scene.map
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

const setUpRayCaster = (scene) => {
  const raycaster = scene.raycasterPlugin.createRaycaster()

  const wallLayerData = scene.map.layers.find(o => o.name === 'wall_layer')
  raycaster.mapGameObjects([wallLayerData.tilemapLayer], false, {
    //array of tile types which collide with rays
    collisionTiles: [1, 2, 3, 22, 30, 31, 32, 38, 39, 40]
  })

  return raycaster
}

const setUpFOVmask = (scene, graphics) => {
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics)
  mask.setInvertAlpha()
  return mask
}

const setUpBackgroundRenderer = (scene, mask, layers) => {
  const map = scene.map
  const renderTexture = scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
  renderTexture.setDepth(10)
  renderTexture.setMask(mask)
  renderTexture.clear()
  renderTexture.fill(0x101010)
  renderTexture.draw(layers)
  return renderTexture
}

const setUpObjectLayers = scene => {
  // fov_layer, info_layer, text_layer, and sensor_layer
  const sensorLayer = scene.map.objects.find(layer => layer.name === 'sensor_layer')
  if (sensorLayer) {
    sensorLayer.objects.forEach(
      object => {
        const sensorData: Sensor = {
          interface: 'Sensor',
          name: object.name,
          phaserObject: null
        }
        if (object.rectangle) {
          const rectangle = scene.add.rectangle(object.x + object.width / 2, object.y + object.height / 2, object.width, object.height)
          const sensor = scene.matter.add.gameObject(rectangle, {
            isSensor: true,
            ignoreGravity: true
          })
          sensorData.phaserObject = sensor
          sensor.setData(sensorData)
        }
      }
    )

  }

  const textLayer = scene.map.objects.find(layer => layer.name === 'text_layer')
  if (textLayer) {
    textLayer.objects.forEach(
      object => {
        const textCenter = {
          x: object.x + object.width / 2,
          y: object.y + object.height / 2
        }
        const text = scene.add.text(textCenter.x, textCenter.y, object.text.text, {
          fontSize: setting.fontSize
        })
        text.setOrigin(0.5, 0.5)
      }
    )
  }
}

const registerMap = (scene, config) => {
  const { mapKey, tilesetKey } = config

  scene.map = setUpMap(scene, mapKey)
  const tileset = setUpTileset(scene, tilesetKey)
  const tileLayers = setUpTileLayers(scene, tileset)
  const objectLayers = setUpObjectLayers(scene)

  scene.rayCaster = setUpRayCaster(scene)
  scene.ray = scene.rayCaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    }
  })

  scene.rendererBoundary = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.05 } })
  const mask = setUpFOVmask(scene, scene.rendererBoundary)
  setUpBackgroundRenderer(scene, mask, tileLayers)
}

const updateFOV = (scene, position) => {
  scene.ray.setOrigin(position.x, position.y)
  const intersections = scene.ray.castCircle()
  scene.rendererBoundary.clear()
  scene.rendererBoundary.fillPoints(intersections)
}

const backgroundMap = {
  registerMap,
  updateFOV
}

export default backgroundMap