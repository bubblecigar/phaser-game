import skins from '../../skins/index'
import { getLocalUserData, setLocalUserData } from '../../user'

const selectableNoob = ['tinyZombie', 'skeleton', 'imp']

let currentIndex = 0
const initIndex = () => {
  try {
    const { activatedSkin } = getLocalUserData()
    currentIndex = selectableNoob.findIndex(skinKey => skinKey === activatedSkin)
  } catch (error) {
    // do nothing
  }
}
initIndex()

const browseSkin = (direction: number) => {
  currentIndex += direction
  currentIndex = (currentIndex + selectableNoob.length) % selectableNoob.length

  return skins[selectableNoob[currentIndex]]
}

const buySkin = (skinKey) => {
  const { coins, skins } = getLocalUserData()
  if (skins.includes(skinKey)) {
    console.log('You already have the skin!')
    return false
  }

  const price = 100
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

