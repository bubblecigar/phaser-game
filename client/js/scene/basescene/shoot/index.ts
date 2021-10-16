import { getLocalUserData } from '../../../user'
import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'
import { shootShadowBall } from './shadowball'
import { shootPotion } from './potion'
import { shootHammer } from './hammer'
import { shootMuddy } from './muddy'

const shoot = ({ scene, from, to, builderId, type, options }) => {
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
    case 'potion': {
      shootPotion({ scene, from, to, builderId, isUser, options })
      break
    }
    case 'hammer': {
      shootHammer({ scene, from, to, builderId, isUser })
      break
    }
    case 'muddy': {
      shootMuddy({ scene, from, to, builderId, isUser, options })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }