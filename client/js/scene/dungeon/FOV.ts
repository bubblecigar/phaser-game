import Phaser from 'phaser'
import _ from 'lodash'
import gameConfig from '../../game/config'
import { MapConfig } from '../../maps/sceneMap'

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
const setUpLayers = (map, tileset) => {
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

const registerRayCaster = (scene, map) => {
  scene.raycaster = scene.raycasterPlugin.createRaycaster()
  scene.ray = scene.raycaster.createRay({
    origin: {
      x: gameConfig.canvasWidth / 2,
      y: gameConfig.canvasHeight / 2,
    }
  })

  const wallLayerData = map.layers.find(o => o.name === 'wall_layer')
  scene.raycaster.mapGameObjects([wallLayerData.tilemapLayer], false, {
    //array of tile types which collide with rays
    collisionTiles: [1, 2, 3, 22, 30, 31, 32, 38, 39, 40]
  })
}

const setUpFOVmask = (scene, map) => {
  registerRayCaster(scene, map)
  graphics = scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.05 } })
  const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics)
  mask.setInvertAlpha()
  return mask
}

const setUpBackgroundRenderer = (scene, mask, map, layers) => {
  const renderTexture = scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
  renderTexture.setDepth(10)
  renderTexture.setMask(mask);
  renderTexture.clear()
  renderTexture.fill('#000000', 1)
  renderTexture.draw(layers)
  return renderTexture
}

const createBackground = (scene, config: MapConfig) => {
  const { mapKey, tilesetKey } = config
  const map = setUpMap(scene, mapKey)
  const tileset = setUpTileset(map, tilesetKey)
  const layers = setUpLayers(map, tileset)
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