import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'
import serverMap from '../../share/serverMap.json'
import gameState, { initGameState } from './game/state'

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
          showEndgameReport: (data) => {
            const gui = game.scene.getScene('GUI')
            gui.scene.launch('endgameReport', data)
            game.scene.bringToTop('endgameReport')
          },
          connectionFail: errorMessage => {
            window.alert(errorMessage)
          },
          gameStartCountDown: time => {
            gameState.gameStartCountDown = time
          },
          updateGameStatus: serverGameState => {
            const { gameStatus } = serverGameState
            const sceneToRun = serverMap[gameStatus].scene
            const scenesActived = game.scene.getScenes(true).map(s => s.scene.key)

            gameState.gameStatus = gameStatus
            gameState.scene = sceneToRun

            const isSynced = scenesActived.includes(sceneToRun)
            if (isSynced) {
              // do nothing
            } else {
              // switch scene
              const sceneToStop = scenesActived.filter(key => (key !== sceneToRun && key !== 'GUI'))[0]
              game.scene.stop(sceneToStop)
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
    updateRoomList: () => {
      socket.emit('update-room-list')
    },
    leaveRoom: () => {
      socket.emit('leave-room')
      initGameState()
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
