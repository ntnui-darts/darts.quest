import { useUsersStore } from '@/stores/users'
import {
  Segment,
  Visit,
  Game,
  GameController,
  getVisitsOfUser,
  getTypeAttribute,
  Leg,
  GameState,
} from '@/types/game'
import {
  getGenericController,
  getResultsOfFirstToWinGame,
} from '@/games/generic'
import { getGamePoints } from './games'

export const getX01Controller = (game: Game): GameController => {
  return {
    ...getGenericController(game),

    getGameState() {
      return {
        ...getResultsOfFirstToWinGame(
          game,
          (game, visits) => getLegScore(visits, game) == getGamePoints(game)
        ),

        getUserResultText(userId) {
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const visits = getVisitsOfUser(game, userId)
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
          return `${rest}\t(${avg})`
        },
      } satisfies GameState
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
  return getAvgVisitScore(first9, game, true)
}

export const getX01VisitScore = (visit: Visit, includeUnfinished = true) => {
  if (!includeUnfinished && visit.includes(null)) return 0
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0)
}

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0
}
