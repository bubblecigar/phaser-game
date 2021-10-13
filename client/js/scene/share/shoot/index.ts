import { shootArrow } from './arrow'

const shoot = ({ scene, from, to, builderId, type }) => {
  switch (type) {
    default: {
      shootArrow({ scene, from, to, builderId })
    }
  }
}

export { shoot }