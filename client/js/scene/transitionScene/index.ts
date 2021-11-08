import beforeStart from './beforeStart'
import preloadAssets from './preloadingAssets'
import afterEnd from './afterEnd'

let serverGameState
let sceneToRun
let transitionContent
let transitionConfig = {
  autoStart: false
}

function init(data) {
  sceneToRun = data.sceneToRun
  serverGameState = data.serverGameState

  if (sceneToRun === 'dungeon') {
    transitionContent = beforeStart
    transitionConfig = {
      autoStart: false
    }
  } else if (sceneToRun === 'waitingRoom' && serverGameState.gameStatus === 'waiting') {
    transitionContent = preloadAssets
    transitionConfig = {
      autoStart: true
    }
  } else if (sceneToRun === 'waitingRoom' && serverGameState.gameStatus === 'ending') {
    transitionContent = afterEnd
    transitionConfig = {
      autoStart: false
    }
  }

  if (transitionContent) {
    transitionContent.init.apply(this, [serverGameState])
  }
}

function preload() {
  if (transitionContent) {
    transitionContent.preload.apply(this)
  }
}

function create() {
  if (transitionContent) {
    transitionContent.create.apply(this)
  }

  const scene = this
  if (transitionConfig.autoStart) {
    scene.scene.start(sceneToRun)
  } else {
    this.input.keyboard.on('keydown', e => {
      if (e.key === ' ') {
        scene.scene.start(sceneToRun)
      }
    })
  }
}

function update(...args) {
  if (transitionContent) {
    transitionContent.update.apply(this, args)
  }
}

export default {
  key: 'transitionScene',
  init,
  preload,
  create,
  update
}