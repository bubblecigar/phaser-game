import charactors from '../../charactors/index'

const skins = Object.keys(charactors).filter(c => c !== 'skull')

let currentIndex = 0

const browseSkin = (direction: number) => {
  currentIndex += direction
  currentIndex = (currentIndex + skins.length) % skins.length

  return charactors[skins[currentIndex]]
}

export {
  browseSkin
}

