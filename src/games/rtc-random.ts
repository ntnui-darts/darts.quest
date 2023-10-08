import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
  Multiplier,
  getTypeAttribute,
  getVisitsOfUser,
} from '@/types/game'
import { getRtcController, getRtcLegScore } from './rtc'

export const getRtcRandomController = (game: Game): GameController => {
  const gameStore = useGameStore()
  const sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)
    .sort(() => Math.random() - 0.5)

  return {
    ...getRtcController(game),
    getUserDisplayText(userId) {
      const score = getRtcLegScore(getVisitsOfUser(game, userId))
      return `${sequence.at(score)}`
    },
    recordHit() {
      const score = getRtcLegScore(gameStore.getCurrentVisits)
      const sector = sequence.at(score)
      if (!sector) return
      gameStore.saveScore({
        multiplier: getTypeAttribute<Multiplier>(game, 'mode', 1),
        sector,
      })
    },
  }
}
