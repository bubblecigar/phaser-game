import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'

const shoot = ({ scene, from, to, builderId, type }) => {
  switch (type) {
    case 'arrow': {
      shootArrow({ scene, from, to, builderId })
      break
    }
    case 'knife': {
      shootKnife({ scene, from, to, builderId })
      break
    }
    case 'fireball': {
      shootFireBall({ scene, from, to, builderId })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }