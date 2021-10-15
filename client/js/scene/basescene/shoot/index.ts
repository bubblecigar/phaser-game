import { getLocalUserData } from '../../../user'
import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'
import { shootShadowBall } from './shadowball'

const shoot = ({ scene, from, to, builderId, type }) => {
  const isUser = getLocalUserData().userId === builderId
  from.y -= 4
  switch (type) {
    case 'arrow': {
      shootArrow({ scene, from, to, builderId, isUser })
      break
    }
    case 'knife': {
      shootKnife({ scene, from, to, builderId, isUser })
      break
    }
    case 'fireball': {
      shootFireBall({ scene, from, to, builderId, isUser })
      break
    }
    case 'shadowball': {
      shootShadowBall({ scene, from, to, builderId, isUser })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }