import forestTileSetUrl from './map/forestTileSet.png'
import readyRoomUrl from './map/readyRoom.json'
import endingRoomUrl from './map/endingRoom.json'
import battleFieldUrl from './map/battle_field.json'
import dotaFieldUrl from './map/dota_field.json'

export default {
  "dungeon": {
    mapKey: 'dotaField',
    mapUrl: dotaFieldUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "waitingRoom": {
    mapKey: 'readyRoom',
    mapUrl: readyRoomUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "endingRoom": {
    mapKey: 'endingRoom',
    mapUrl: endingRoomUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  }
}
