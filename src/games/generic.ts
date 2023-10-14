import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
  Multiplier,
  multiplierToString,
} from '@/types/game'

export const getGenericController = (game: Game) => {
  return {
    game,
    winnerFinishesFirst() {
      return true
    },
    getSegmentText(segment) {
      if (!segment) return '-'
      if (!segment.multiplier || segment.multiplier == 1)
        return segment.sector.toString()
      return `${multiplierToString(segment.multiplier)} x ${segment.sector}`
    },
    recordHit(segment) {
      if (!segment) return
      useGameStore().saveScore(segment)
    },
    recordMiss() {
      useGameStore().saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  } satisfies Partial<GameController>
}
