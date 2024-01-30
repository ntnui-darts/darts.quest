import { speak } from '@/functions/speak'
import { getGenericController, simulateFirstToWinGame } from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameState,
  Segment,
  Visit,
  getTypeAttribute,
  getVisitsOfUser,
} from '@/types/game'
import { GameType, getGamePoints } from './games'

export const getX01Controller = (game: Game): GameController<GameState> => {
  return {
    ...getGenericController(game),

    getGameState() {
      return {
        ...simulateFirstToWinGame(
          game,
          (game, visits) => getX01LegScore(visits, game) == getGamePoints(game)
        ),

        getUserResultText(userId) {
          const name = useUsersStore().getName(userId)
          const visits = getVisitsOfUser(game, userId)
          const avg = getAvgVisitScore(
            game.legs.find((leg) => leg.userId == userId)?.visits ?? [],
            game
          ).toFixed(1)
          return `${name}, ${visits?.length} visits, ${avg} average`
        },

        getUserDisplayText(userId) {
          const visits = getVisitsOfUser(game, userId)
          const rest = getGamePoints(game) - getX01LegScore(visits, game)
          const avg = getAvgVisitScore(visits, game).toFixed(1)
          return `${rest}\t(${avg})`
        },

        getTopRightText() {
          return ''
        },
      } satisfies GameState
    },

    recordHit(segment) {
      if (!segment) return
      const gameStore = useGameStore()
      const player = gameStore.gameState?.player
      let visit = gameStore.getCurrentVisit
      if (!gameStore.game || !player) return
      const prevScore = getX01LegScore(
        getVisitsOfUser(gameStore.game, player),
        gameStore.game
      )
      gameStore.saveScore(segment)
      visit = gameStore.getCurrentVisit
      if (segment.sector > 0 && visit) {
        const score = getX01LegScore(
          getVisitsOfUser(gameStore.game, player),
          gameStore.game
        )
        if (score <= prevScore) {
          for (let i = 0; i < visit.length; i++) {
            if (!visit[i]) {
              visit[i] = { multiplier: 0, sector: 0 }
            }
          }
          speak('Bust!')
        }
      }
      gameStore.refreshGameState()
    },

    speakVisit(visit) {
      const score = getX01VisitScore(visit)
      if (!score) speak('No score!')
      else speak(`${score}!`)
    },
  }
}

export const getX01LegScore = (
  visits: Visit[],
  game: {
    type: GameType
    typeAttributes: string[]
  }
) => {
  let score = 0
  const points = getGamePoints(game)
  const finishType = getTypeAttribute(game, 'finish', 1)
  visits?.forEach((v) => {
    const visitScore = getX01VisitScore(v)
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

export const getAvgVisitScore = (
  visits: Visit[] | null,
  game: {
    type: GameType
    typeAttributes: string[]
  }
) => {
  if (!visits || visits.length == 0) return 0
  const segmentCount = visits.flat().filter((visit) => visit != null).length
  if (!segmentCount) return 0
  return (getX01LegScore(visits, game) * 3) / segmentCount
}

export const getFirst9Avg = (
  visits: Visit[] | null,
  game: {
    type: GameType
    typeAttributes: string[]
  }
) => {
  if (!visits) return 0
  const first9 = visits.slice(0, 3)
  return getAvgVisitScore(first9, game)
}

export const getX01VisitScore = (visit: Visit) => {
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0)
}

export const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0
}
