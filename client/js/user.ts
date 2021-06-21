import { v4 } from 'uuid'

const localKey = 'farm-user'

interface User {
  userId: string
}

const defaultUserData: User = {
  userId: v4()
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
  localStorage.setItem(localKey, JSON.stringify({ ...oldData, ...data }))
}

export { getLocalUserData, setLocalUserData }