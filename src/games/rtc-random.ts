import { GameExtended } from '@/types/game'
import { RtcController, getRtcController } from './rtc'

export const getRtcRandomController = (game: GameExtended): RtcController => {
  if (!game.extension || game.extension.kind != 'rtc') {
    game.extension = {
      kind: 'rtc',
      sequence: Array(20)
        .fill(undefined)
        .map((_, i) => i + 1)
        .sort(() => Math.random() - 0.5),
    }
  }

  return {
    ...getRtcController(game),
  }
}
