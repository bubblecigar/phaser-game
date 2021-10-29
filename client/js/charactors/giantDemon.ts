import { Charactor } from '.'

const createCharactor = (key): Charactor => ({
  key,
  skin: key,
  shootType: 'shadowball',
  shootInterval: 500,
  vision: 200
})

export default createCharactor('giantDemon')