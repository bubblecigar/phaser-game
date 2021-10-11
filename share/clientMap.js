import forestTileSetUrl from './map/forestTileSet.png'
import jumpPlatFormUrl from './map/jumpPlatForm.json'
import readyRoomUrl from './map/readyRoom.json'
import endingRoomUrl from './map/endingRoom.json'

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
  },
  "endingRoom": {
    mapKey: 'endingRoom',
    mapUrl: endingRoomUrl,
    tilesetKey: 'forestTileSet',
    tilesetUrl: forestTileSetUrl
  }
}
