import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  GameType,
  GamePoints,
  Segment,
  Visit,
  Game,
  GameController,
  getVisitsOfUser,
  multiplierToString,
  Multiplier,
} from '@/types/game'

export const getX01Controller = (game: Game): GameController => {
  const gameStore = useGameStore()
  return {
    game,
    getCurrentLegScore() {
      return getLegScore(
        getVisitsOfUser(game, gameStore.userId),
        game.type,
        game.finishType
      )
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      const avg = getAvgVisitScore(
        game.legs.find((leg) => leg.userId == userId)?.visits ?? [],
        game.type,
        game.finishType,
        true
      ).toFixed(1)
      return `${name}, ${visits} visits, ${avg} average`
    },
    getUserDisplayText(userId) {
      const visits = getVisitsOfUser(game, userId)
      const rest =
        (GamePoints[game.type] ?? 0) -
        getLegScore(visits, game.type, game.finishType)
      const avg = getAvgVisitScore(visits, game.type, game.finishType).toFixed(
        1
      )
      return `${rest} (${avg})`
    },
    getSegmentText(segment) {
      return segment
        ? `${multiplierToString(segment.multiplier)} - ${segment.sector}`
        : '-'
    },
    recordHit(segment) {
      if (!segment) return
      gameStore.saveScore(segment)
    },
    recordMiss() {
      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

const getLegScore = (
  visits: Visit[],
  gameType: GameType,
  finishType: 1 | 2 | 3,
  includeUnfinished = true
) => {
  let score = 0
  visits?.forEach((v) => {
    const visitScore = getVisitScore(v, includeUnfinished)
    if (score + visitScore == GamePoints[gameType]) {
      if (
        finishType == 1 ||
        (v.findLast((s) => s != null)?.multiplier ?? 0) == finishType
      ) {
        score += visitScore
      }
    } else if (score + visitScore < GamePoints[gameType]) {
      const rest = GamePoints[gameType] - score - visitScore
      if (rest >= finishType) {
        score += visitScore
      }
    }
  })
  return score
}

const getAvgVisitScore = (
  visits: Visit[] | null,
  gameType: GameType,
  finishType: 1 | 2 | 3,
  includeUnfinished = false
) => {
  if (!visits || visits.length == 0) return 0
  const count = includeUnfinished
    ? visits.length
    : visits.filter((visit) => !visit.includes(null)).length
  if (!count) return 0
  return getLegScore(visits, gameType, finishType, includeUnfinished) / count
}

export const getFirst9Avg = (
  visits: Visit[] | null,
  gameType: GameType,
  finishType: 1 | 2 | 3
) => {
  if (!visits) return 0
  const first9 = visits.slice(0, 3)
  return getAvgVisitScore(first9, gameType, finishType)
}

const getVisitScore = (visit: Visit, includeUnfinished = true) => {
  if (!includeUnfinished && visit.includes(null)) return 0
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0)
}

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0
}
