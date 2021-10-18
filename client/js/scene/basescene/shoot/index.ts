import { getLocalUserData } from '../../../user'
import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'
import { shootShadowBall } from './shadowball'
import { shootPotion } from './potion'
import { shootHammer } from './hammer'
import { shootMuddy } from './muddy'
import { shootIce } from './ice'
import { shootCoin } from './coin'

export const bulletsRefKey = 'bullets_storage'

const shoot = ({ scene, from, to, builderId, type, options }) => {
  const isUser = getLocalUserData().userId === builderId
  from.y -= 4

  if (!scene[bulletsRefKey]) {
    scene[bulletsRefKey] = {}
  }
  const bulletsRef = scene[bulletsRefKey]

  switch (type) {
    case 'arrow': {
      shootArrow({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    case 'knife': {
      shootKnife({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    case 'fireball': {
      shootFireBall({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    case 'shadowball': {
      shootShadowBall({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    case 'potion': {
      shootPotion({ scene, bulletsRef, from, to, builderId, isUser, options })
      break
    }
    case 'hammer': {
      shootHammer({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    case 'muddy': {
      shootMuddy({ scene, bulletsRef, from, to, builderId, isUser, options })
      break
    }
    case 'ice': {
      shootIce({ scene, bulletsRef, from, to, builderId, isUser, options })
      break
    }
    case 'coin': {
      shootCoin({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }