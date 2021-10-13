import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'
import serverMap from '../../share/serverMap.json'
import gameState from './game/state'

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
          connectionFail: errorMessage => {
            window.alert(errorMessage)
          },
          updateGameStatus: serverGameState => {
            const { gameStatus } = serverGameState
            const sceneToRun = serverMap[gameStatus].scene
            const scenesActived = game.scene.getScenes(true).map(s => s.scene.key)
            const scenesToStop = scenesActived.filter(key => (key !== sceneToRun && key !== 'GUI'))
            const isSynced = scenesActived.includes(sceneToRun)
            if (isSynced) {
              // do nothing
            } else {
              // switch scene
              scenesToStop.forEach(
                sceneKey => {
                  game.scene.stop(sceneKey)
                }
              )
              game.scene.start(sceneToRun, serverGameState)
              game.scene.bringToTop('GUI')
            }

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
    leaveRoom: () => {
      socket.emit('leave-room')
      gameState.players = []
      gameState.items = []
      gameState.winner = null
      gameState.gameStatus = 'waiting'
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
