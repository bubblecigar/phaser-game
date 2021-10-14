import { shootArrow } from './arrow'

const shoot = ({ scene, from, to, builderId, type }) => {
  switch (type) {
    case 'arrow': {
      shootArrow({ scene, from, to, builderId })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }