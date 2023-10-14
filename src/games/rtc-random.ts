import { Game } from '@/types/game'
import { RtcController, getRtcController } from './rtc'

export const getRtcRandomController = (game: Game): RtcController => {
  const sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)
    .sort(() => Math.random() - 0.5)

  return {
    ...getRtcController(game),

    getSequence() {
      return sequence
    },
  }
}
