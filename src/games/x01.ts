import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Segment,
  Visit,
  Game,
  GameController,
  getVisitsOfUser,
  multiplierToString,
  Multiplier,
  getTypeAttribute,
  getGamePoints,
  Leg,
} from '@/types/game'

export const getX01Controller = (game: Game): GameController => {
  const gameStore = useGameStore()
  return {
    game,
    getCurrentLegScore() {
      return getLegScore(getVisitsOfUser(game, gameStore.userId), game)
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      const avg = getAvgVisitScore(
        game.legs.find((leg) => leg.userId == userId)?.visits ?? [],
        game,
        true
      ).toFixed(1)
      return `${name}, ${visits?.length} visits, ${avg} average`
    },
    getUserDisplayText(userId) {
      const visits = getVisitsOfUser(game, userId)
      const rest = getGamePoints(game) - getLegScore(visits, game)
      const avg = getAvgVisitScore(visits, game).toFixed(1)
      return `${rest} (${avg})`
    },
    getSegmentText(segment) {
      if (!segment) return '-'
      if (!segment.multiplier || segment.multiplier == 1)
        return segment.sector.toString()
      return `${multiplierToString(segment.multiplier)} x ${segment.sector}`
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
  game: Game | Leg,
  includeUnfinished = true
) => {
  let score = 0
  const points = getGamePoints(game)
  const finishType = getTypeAttribute(game, 'finish', 1)
  visits?.forEach((v) => {
    const visitScore = getX01VisitScore(v, includeUnfinished)
    if (score + visitScore == points) {
      if (
        finishType == 1 ||
        (v.findLast((s) => s != null)?.multiplier ?? 0) == finishType
      ) {
        score += visitScore
      }
    } else if (score + visitScore < points) {
      const rest = points - score - visitScore
      if (rest >= finishType) {
        score += visitScore
      }
    }
  })
  return score
}

const getAvgVisitScore = (
  visits: Visit[] | null,
  game: Game | Leg,
  includeUnfinished = false
) => {
  if (!visits || visits.length == 0) return 0
  const count = includeUnfinished
    ? visits.length
    : visits.filter((visit) => !visit.includes(null)).length
  if (!count) return 0
  return getLegScore(visits, game, includeUnfinished) / count
}

export const getFirst9Avg = (visits: Visit[] | null, game: Game | Leg) => {
  if (!visits) return 0
  const first9 = visits.slice(0, 3)
  return getAvgVisitScore(first9, game)
}

export const getX01VisitScore = (visit: Visit, includeUnfinished = true) => {
  if (!includeUnfinished && visit.includes(null)) return 0
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0)
}

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0
}
