import skins from '../../skins/index'
import { getLocalUserData, setLocalUserData } from '../../user'

const _skins = Object.keys(skins).filter(c => c !== 'skull')

let currentIndex = 0
const initIndex = () => {
  try {
    const { activatedSkin } = getLocalUserData()
    currentIndex = _skins.findIndex(skinKey => skinKey === activatedSkin)
  } catch (error) {
    // do nothing
  }
}
initIndex()

const browseSkin = (direction: number) => {
  currentIndex += direction
  currentIndex = (currentIndex + _skins.length) % _skins.length

  return skins[_skins[currentIndex]]
}

const buySkin = (skinKey) => {
  const { coins, skins } = getLocalUserData()
  if (skins.includes(skinKey)) {
    console.log('You already have the skin!')
    return false
  }

  const price = 10
  if (coins < price) {
    console.log("You don't have enough coins to buy the skin")
    return false
  }

  // buy the skin
  setLocalUserData({
    coins: coins - price,
    skins: [...skins, skinKey]
  })

  return true
}

const activateSkin = (skinKey) => {
  const { skins } = getLocalUserData()
  if (!skins.includes(skinKey)) {
    console.log('You dont have the skin!')
    return false
  }

  // activate the skin
  setLocalUserData({
    activatedSkin: skinKey
  })

  return true
}

export {
  browseSkin,
  buySkin,
  activateSkin
}

