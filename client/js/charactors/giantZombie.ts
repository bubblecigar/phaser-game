import { Charactor } from '.'

const createCharactor = (key): Charactor => ({
  key,
  skin: key,
  shootType: 'muddy',
  shootInterval: 333,
  vision: 100
})

export default createCharactor('giantZombie')