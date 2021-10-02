import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'


export const connectToServer = () => {
  const socket = io.connect({
    auth: {
      ...getLocalUserData()
    }
  })
  return socket
}

export const getSocketMethods = socket => {
  let sceneListners = []
  return {
    registerGameSocketEvents: game => {
      socket.on('game', (key, ...args) => {
        const methods = {
          updateGameStatus: gameStatus => {
            const statusSceneMap = {
              "waiting": ["waitingRoom"],
              "processing": ["dungeon", "GUI"],
              "ending": ["login"]
            }

            const scenesToRun = statusSceneMap[gameStatus]
            const scenesActived = game.scene.getScenes(true)

            scenesActived.forEach(
              scene => {
                const sceneKey = scene.scene.key
                if (!scenesToRun.includes(sceneKey)) {
                  game.scene.stop(sceneKey)
                }
              }
            )

            scenesToRun.forEach(
              sceneKey => {
                game.scene.run(sceneKey)
              }
            )
          }
        }
        try {
          methods[key](...args)
        } catch (error) {
          console.log(error)
        }
      })
    },
    registerSceneSocketEvents: (sceneKey, methods) => {
      sceneListners.forEach(
        listener => socket.removeAllListeners(listener)
      )

      sceneListners = [sceneKey, 'all-scene']
      socket.on(sceneKey, (methodKey, ...args) => {
        try {
          methods[methodKey](...args)
        } catch (e) {
          console.log(e)
        }
      })
      socket.on('all-scene', (methodKey, ...args) => {
        try {
          methods[methodKey](...args)
        } catch (e) {
          console.log(e)
        }
      })
    },
    changeRoom: roomId => {
      socket.emit('change-room', roomId)
    },
    enterScene: sceneKey => {
      socket.emit('enter-scene', sceneKey)
    },
    clientsInScene: (sceneKey, methods, key, ...args) => {
      methods[key](...args)
      socket.emit('clients', sceneKey, key, ...args)
    },
    server: (key, ...args) => {
      socket.emit('server', key, ...args)
    }
  }
}
