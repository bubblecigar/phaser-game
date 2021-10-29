import skins from '../skins/index'

// item should not bigger than caster
export const normalizeMatter = (performer, item, matter) => {
  const skin = skins[performer.skin]
  const performerHeight = skin.matterConfig.size.height
  const itemSize = item.matterConfig.size
  let itemHeight
  if (item.matterConfig.type === 'circle') {
    itemHeight = itemSize.radius * 2
  } else {
    itemHeight = itemSize.height
  }
  if (itemHeight * 1.3 > performerHeight) {
    const shrinkFactor = performerHeight / (itemHeight * 1.3)
    matter.setScale(shrinkFactor)
  }
}

export const playAnimation = (item, matter) => {
  const animkey = item?.animsConfig?.idle?.key
  if (animkey) {
    matter.play(animkey)
  }
}