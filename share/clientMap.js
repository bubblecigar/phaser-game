import forestTileSetUrl from './map/forestTileSet.png'
import readyRoomUrl from './map/readyRoom.json'
import endingRoomUrl from './map/endingRoom.json'
import battleFieldUrl from './map/battle_field.json'
import dotaFieldUrl from './map/dota_field.json'
import simpleMapUrl from './map/simple_map.json'
import treeMapUrl from './map/tree_map.json'
import caveMapUrl from './map/cave_map.json'

export const maps = {
  "dotaField": {
    mapKey: 'dotaField',
    mapUrl: dotaFieldUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "simpleMap": {
    mapKey: 'simpleMap',
    mapUrl: simpleMapUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "treeMap": {
    mapKey: 'treeMap',
    mapUrl: treeMapUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "caveMap": {
    mapKey: 'caveMap',
    mapUrl: caveMapUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "readyRoom": {
    mapKey: 'readyRoom',
    mapUrl: readyRoomUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  }
}
