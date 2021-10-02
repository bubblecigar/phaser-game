import tilesetUrl from '../../statics/tile/tileset.png'
import dungeonMapUrl from '../../statics/tile/dungeon_map.json'
import roomMapUrl from '../../statics/tile/room_map.json'
import tinyTileSetUrl from '../../statics/tile/tinyroom.png'
import tinyRoomUrl from '../../statics/tile/tiny_map.json'
import waitingRoomUrl from '../../statics/tile/waitingRoom.json'
import jumpPlatFormUrl from '../../statics/tile/jumpPlatForm.json'
import forestTileSetUrl from '../../statics/tile/forestTileSet.png'
import readyRoomUrl from '../../statics/tile/readyRoom.json'

export default {
  "dungeon": {
    mapKey: 'jumpPlatForm',
    mapUrl: jumpPlatFormUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  },
  "waitingRoom": {
    mapKey: 'readyRoom',
    mapUrl: readyRoomUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  }
}
