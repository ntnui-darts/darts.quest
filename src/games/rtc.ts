import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Visit,
  getVisitsOfUser,
  Multiplier,
  getTypeAttribute,
  GamePoints,
} from '@/types/game'

export type RtcController = GameController & { getSequence(): number[] }

export const getRtcController = (game: Game): RtcController => {
  const gameStore = useGameStore()
  const sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)

  return {
    game,
    getSequence() {
      return sequence
    },
    getCurrentLegScore() {
      return getRtcLegScore(game, getVisitsOfUser(game, gameStore.userId))
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      return `${name}, ${visits?.length} visits`
    },
    getUserDisplayText(userId) {
      const score = getRtcLegScore(game, getVisitsOfUser(game, userId))
      return `${this.getSequence().at(score)}`
    },
    getSegmentText(segment) {
      return segment ? `${segment.sector}` : '-'
    },
    recordHit(segment) {
      gameStore.saveScore(segment)
    },
    recordMiss() {
      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

export const getCurrentSector = (game: Game, visits: Visit[]) => {
  return getRtcLegScore(game, visits) + 1
}

const sumNumbers = (numbers: number[]) => {
  return numbers.reduce((prev, current) => prev + current, 0)
}

export const getRtcLegScore = (game: Game, visits: Visit[]) => {
  return Math.min(
    GamePoints[game.type],
    sumNumbers(visits.map((v) => getVisitScore(game, v)))
  )
}

const getVisitScore = (game: Game, visit: Visit) => {
  const isFast = getTypeAttribute<Boolean>(game, 'fast', false)
  return sumNumbers(
    visit.map((seg) => (seg ? (isFast ? seg.multiplier : 1) : 0))
  )
}
