import { v4 } from 'uuid'

const localKey = 'farm-user'
const defaultUserData = {
  userId: v4()
}

const getLocalUserData = () => {
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
  localStorage.setItem(localKey, JSON.stringify({ ...oldData, ...data }))
}

export { getLocalUserData, setLocalUserData }