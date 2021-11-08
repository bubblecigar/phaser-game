import { getLocalUserData } from '../../user'
import gameState from '../../game/state'

export const resurrectText = (scene, player) => {
  const text = scene.add.text(player.position.x, player.position.y + 10, '', {
    fontSize: '8px'
  })
  text.setDepth(10)
  text.setOrigin(0.5, 0.5)

  const timer = scene.time.addEvent({
    delay: 50,                // ms
    callback: () => {
      const _player = gameState.players.find(p => p.id === getLocalUserData().userId)
      if (text) {
        const countdown = (_player.resurrectCountDown / 1000).toFixed(2)
        text.setText(countdown)
      }
      const remaining = timer.getRepeatCount()
      if (remaining <= 0) {
        text.destroy()
        timer.remove()
      }
    },
    callbackScope: scene,
    repeat: 100
  });
}

export const popText = (scene, position: { x: number, y: number }, string: string, options) => {
  const dx = (Math.random() - 0.5) * 20
  const dy = -Math.random() * 5
  const text = scene.add.text(position.x + dx, position.y + dy, string, options)
  text.setOrigin(0.5, 0.5)
  const repeat = 1000
  const targetHeight = position.y + dy - 30
  const timer = scene.time.addEvent({
    delay: 50,                // ms
    callback: () => {
      if (text) {
        text.setY(text.y - 2)
        if (text.y <= targetHeight) {
          text.destroy()
          timer.remove()
        }
      }
    },
    callbackScope: scene,
    repeat: repeat
  })
}
