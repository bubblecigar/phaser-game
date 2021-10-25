import { getLocalUserData } from '../../../user'
import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'
import { shootShadowBall } from './shadowball'
import { shootPotion } from './potion'
import { shootSoundWave } from './soundwave'
import { shootMuddy } from './muddy'
import { shootIce } from './ice'
import { shootCoin } from './coin'
import { tab } from './tab'

export const bulletsRefKey = 'bullets_storage'

const shoot = ({ scene, to, builderId, type, options, shooter }) => {
  if (!shooter || !shooter.phaserObject) {
    return
  }
  const from = { x: shooter.phaserObject.x, y: shooter.phaserObject.y }
  const isUser = getLocalUserData().userId === builderId

  if (!scene[bulletsRefKey]) {
    scene[bulletsRefKey] = {}
  }
  const bulletsRef = scene[bulletsRefKey]

  switch (type) {
    case 'tab': {
      tab({ scene, bulletsRef, from, to, builderId, isUser })
      break
    }
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
    case 'soundwave': {
      shootSoundWave({ scene, bulletsRef, from, to, builderId, isUser, shooter })
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