import { checkouts } from '@/data/checkouts'
import { speak } from '@/functions/speak'
import { getGenericController, simulateFirstToWinGame } from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameExtended,
  GameState,
  MaybeSegment,
  Visit,
  getLegOfUser,
  getVisitsOfUser,
  isSegment,
} from '@/types/game'
import {
  getTypeAttribute,
  getTypeAttributeOrDefault,
} from '@/types/typeAttributes'
import { GameType, getGamePoints } from './games'

export const getX01Controller = (
  game: GameExtended
): GameController<GameState> => {
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
          const scored = getX01LegScore(visits, game)
          const rest = getGamePoints(game) - scored

          return `${rest}`
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

export const userOnNine = (game: Game, userId: string) => {
  const visits = getLegOfUser(game, userId)?.visits ?? []
  const scored = getX01LegScore(visits, game)
  const dartsThrown = visits.flat().filter((segment) => segment != null).length
  if (
    dartsThrown == 0 ||
    game.type != 'x01' ||
    getTypeAttribute(game, 'finish') != 2 ||
    getTypeAttribute(game, 'startScore') != 501
  )
    return false
  if (
    checkouts['3 darts'].some(
      (obj) =>
        obj.checkout == (501 - scored - 60 * (6 - dartsThrown)).toString()
    )
  ) {
    return true
  }
  return false
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
  const finishType = getTypeAttributeOrDefault(game, 'finish')
  visits?.forEach((v) => {
    const visitScore = getX01VisitScore(v)
    if (score + visitScore == points) {
      const lastSegment = v.findLast((s) => s != null)
      if (
        finishType == 1 ||
        (isSegment(lastSegment) && (lastSegment?.multiplier ?? 0) == finishType)
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
  const segmentCount = visits
    .flat()
    .filter((segment) => isSegment(segment)).length
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
  return visit.reduce(
    (prev: number, current) => prev + getSegmentScore(current),
    0
  )
}

export const getSegmentScore = (segment: MaybeSegment | undefined) => {
  if (!isSegment(segment)) return 0
  return segment ? segment.multiplier * segment.sector : 0
}
