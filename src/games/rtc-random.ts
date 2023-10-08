import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
  Multiplier,
  getTypeAttribute,
} from '@/types/game'
import { getRtcController } from './rtc'

export const getRtcRandomController = (game: Game): GameController => {
  const gameStore = useGameStore()
  const _sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)
    .sort(() => Math.random() - 0.5)
  const sequences: Record<string, number[]> = {}
  game.players.forEach((player) => {
    sequences[player] = [..._sequence]
  })
  return {
    ...getRtcController(game),
    getUserDisplayText(userId) {
      return `${sequences[userId].at(-1)}`
    },
    recordHit() {
      if (!gameStore.userId) throw Error()
      const sequence = sequences[gameStore.userId]
      if (!sequence) throw Error()
      const sector = sequence.at(-1)
      if (!sector) return
      gameStore.saveScore({
        multiplier: getTypeAttribute<Multiplier>(game, 'mode', 1),
        sector,
      })
      sequence.pop()
    },
  }
}
