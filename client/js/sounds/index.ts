import small_hit from '../../statics/sound/small_hit.mp3'
import coin from '../../statics/sound/coin.wav'
import bot from '../../statics/sound/bot.mp3'
import jump_coin from '../../statics/sound/jump-coin.wav'
import jump from '../../statics/sound/jump.wav'

export const sounds = {
  quickJump: {
    url: jump_coin,
  },
  shoot: {
    url: jump
  },
  switch: {
    url: bot
  },
  collect: {
    url: coin
  }
}