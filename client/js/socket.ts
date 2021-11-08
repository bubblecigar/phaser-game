import _ from 'lodash'
import io from 'socket.io-client'
import { getLocalUserData } from './user'
import serverMap from '../../share/serverMap.json'
import gameState, { initGameState } from './game/state'
import { Player } from './Interface'

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
          gameStartCountDown: time => {
            gameState.gameStartCountDown = time
          },
          resetPlayer: (playerConstructor: Player) => {
            const player = gameState.players.find(player => player.id === getLocalUserData().userId)
            Object.keys(playerConstructor).forEach(
              key => {
                player[key] = playerConstructor[key]
              }
            )
            player.skin = getLocalUserData().activatedSkin
          },
          changeScene: ({ sceneToRun, serverGameState }) => {
            Object.keys(serverGameState).forEach(
              key => {
                gameState[key] = serverGameState[key]
              }
            )

            const scenesActived = game.scene.getScenes(true)
            scenesActived.forEach(
              (scene, i) => {
                const reverseIndex = scenesActived.length - i - 1
                if (reverseIndex === 0) {
                  scenesActived[0].scene.start(sceneToRun, { serverGameState })
                } else {
                  scenesActived[scenesActived.length - i - 1].scene.stop()
                }
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
    updateRoomLog: () => {
      socket.emit('update-room-log')
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
