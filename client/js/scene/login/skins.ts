import charactors from '../../charactors/index'
import { getLocalUserData, setLocalUserData } from '../../user'

const skins = Object.keys(charactors).filter(c => c !== 'skull')

let currentIndex = 0

const browseSkin = (direction: number) => {
  currentIndex += direction
  currentIndex = (currentIndex + skins.length) % skins.length

  return skins[currentIndex]
}

const buySkin = (skinKey) => {
  const { coins, skins } = getLocalUserData()
  if (skins.includes(skinKey)) {
    console.log('You already have the skin!')
    return false
  }
  const price = charactors[skinKey].price || 10
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

export {
  browseSkin,
  buySkin
}

