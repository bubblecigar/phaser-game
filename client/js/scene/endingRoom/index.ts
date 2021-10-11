import basescene from '../share/index'

function create() {
  basescene.create.apply(this)
}

function update(...args) {
  basescene.update.apply(this, args)
}

export default {
  key: 'endingRoom',
  init: basescene.init,
  preload: basescene.preload,
  create,
  update
}