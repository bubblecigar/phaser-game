import { v4 } from 'uuid'
import store from 'store'

const localKey = 'farm-user'

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
    const localUserData = store.get(localKey)
    if (!localUserData) {
      localStorage.set(localKey, defaultUserData)
      return defaultUserData
    } else {
      const userData = localUserData
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
  store.set(localKey, mergedData)
}


const countUpCoin = () => {
  const userData = getLocalUserData()
  setLocalUserData({
    historyCoins: userData.historyCoins + 1,
    coins: userData.coins + 1
  })
}

export { getLocalUserData, setLocalUserData, countUpCoin }