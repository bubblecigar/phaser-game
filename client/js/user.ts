import { v4 } from 'uuid'

const localKey = 'pixel-fighter'

interface User {
  userId: string,
  username: string,
  roomId: string,
  kills: number,
  death: number,
  wins: number,
  loses: number,
  historyCoins: number,
  coins: number,
  skins: string[],
  activatedSkin: string
}

const defaultUserData: User = {
  userId: v4(),
  username: '',
  roomId: '',
  kills: 0,
  death: 0,
  wins: 0,
  loses: 0,
  historyCoins: 0,
  coins: 0,
  skins: ['tinyZombie'],
  activatedSkin: 'tinyZombie'
}

const getLocalUserData = (): User => {
  try {
    const localUserData = localStorage.getItem(localKey)
    if (!localUserData) {
      localStorage.setItem(localKey, JSON.stringify(defaultUserData))
      return defaultUserData
    } else {
      const userData = JSON.parse(localUserData)
      return userData
    }
  } catch (err) {
    return defaultUserData
  }
}

const setLocalUserData = data => {
  const oldData = getLocalUserData()
  const mergedData = { ...oldData, ...data }
  // normalize data with defined format
  Object.keys(defaultUserData).forEach(
    key => {
      if (mergedData[key] === undefined) {
        mergedData[key] = defaultUserData[key]
      }
    }
  )
  localStorage.setItem(localKey, JSON.stringify(mergedData))
}


const countUpCoin = () => {
  const userData = getLocalUserData()
  setLocalUserData({
    historyCoins: userData.historyCoins + 1,
    coins: userData.coins + 1
  })
}

export { getLocalUserData, setLocalUserData, countUpCoin }