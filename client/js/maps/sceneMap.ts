import jumpPlatFormUrl from '../../statics/tile/jumpPlatForm.json'
import forestTileSetUrl from '../../statics/tile/forestTileSet.png'
import readyRoomUrl from '../../statics/tile/readyRoom.json'

export interface MapConfig {
  mapKey: string,
  mapUrl: string,
  tilesetKey: string,
  tilesetUrl: string
}

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
