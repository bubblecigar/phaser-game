import { getLocalUserData } from '../../../user'
import collisionCategories from '../collisionCategories'
import { shootArrow } from './arrow'
import { shootKnife } from './knife'
import { shootFireBall } from './fireball'
import { shootShadowBall } from './shadowball'
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

  let collisionCategory
  let collisionTargets
  if (shooter.interface === 'Monster') {
    collisionCategory = collisionCategories.CATEGORY_MOSNTER_BULLET
    collisionTargets = [
      collisionCategories.CATEGORY_PLAYER,
      collisionCategories.CATEGORY_MAP_BLOCK
    ]
  } else {
    if (isUser) {
      collisionCategory = collisionCategories.CATEGORY_PLAYER_BULLET
    } else {
      collisionCategory = collisionCategories.CATEGORY_ENEMY_BULLET
    }
    collisionTargets = [
      collisionCategories.CATEGORY_PLAYER,
      collisionCategories.CATEGORY_MAP_BLOCK,
      collisionCategories.CATEGORY_MONSTER
    ]
  }

  if (!scene[bulletsRefKey]) {
    scene[bulletsRefKey] = {}
  }
  const bulletsRef = scene[bulletsRefKey]

  switch (type) {
    case 'tab': {
      tab({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    case 'arrow': {
      shootArrow({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    case 'knife': {
      shootKnife({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    case 'fireball': {
      shootFireBall({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    case 'shadowball': {
      shootShadowBall({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    case 'soundwave': {
      shootSoundWave({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets, shooter })
      break
    }
    case 'muddy': {
      shootMuddy({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets, options })
      break
    }
    case 'ice': {
      shootIce({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets, options })
      break
    }
    case 'coin': {
      shootCoin({ scene, bulletsRef, from, to, builderId, isUser, collisionCategory, collisionTargets })
      break
    }
    default: {
      console.log('invalid shoot type')
    }
  }
}

export { shoot }