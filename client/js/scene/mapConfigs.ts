import tilesetUrl from '../../statics/tile/tileset.png'
import dungeonMapUrl from '../../statics/tile/dungeon_map.json'
import roomMapUrl from '../../statics/tile/room_map.json'
import tinyTileSetUrl from '../../statics/tile/tinyroom.png'
import tinyRoomUrl from '../../statics/tile/tiny_map.json'

export interface MapConfig {
  mapKey: string,
  mapUrl: string,
  tilesetKey: string,
  tilesetUrl: string
}

const dungeonMapConfig: MapConfig = {
  mapKey: 'dungeon',
  mapUrl: dungeonMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl
}
const roomMapConfig: MapConfig = {
  mapKey: 'room',
  mapUrl: roomMapUrl,
  tilesetKey: 'tileset',
  tilesetUrl: tilesetUrl
}
const ghostRoomConfig: MapConfig = {
  mapKey: 'tiny_room',
  mapUrl: tinyRoomUrl,
  tilesetKey: 'tinyroom',
  tilesetUrl: tinyTileSetUrl
}

export default { dungeonMapConfig, roomMapConfig, ghostRoomConfig }