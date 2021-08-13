import tilesetUrl from '../../statics/tile/tileset.png'
import dungeonMapUrl from '../../statics/tile/dungeon_map.json'
import roomMapUrl from '../../statics/tile/room_map.json'
import tinyTileSetUrl from '../../statics/tile/tinyroom.png'
import tinyRoomUrl from '../../statics/tile/tiny_map.json'
import waitingRoomUrl from '../../statics/tile/waitingRoom.json'
import jumpPlatFormUrl from '../../statics/tile/jumpPlatForm.json'
import forestTileSetUrl from '../../statics/tile/forestTileSet.png'

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
const waitingRoomConfig: MapConfig = {
  mapKey: 'waitingRoom',
  mapUrl: waitingRoomUrl,
  tilesetKey: 'tinyroom',
  tilesetUrl: tinyTileSetUrl
}
const jumpPlatFormConfig: MapConfig = {
  mapKey: 'jumpPlatForm',
  mapUrl: jumpPlatFormUrl,
  tilesetKey: 'forestTileSet',
  tilesetUrl: forestTileSetUrl
}

export default { jumpPlatFormConfig, dungeonMapConfig, roomMapConfig, ghostRoomConfig, waitingRoomConfig }