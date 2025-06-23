import { speak } from '@/functions/speak'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameExtended,
  GameState,
  Multiplier,
  Segment,
  Visit,
  getVisitsOfUser,
  isSegment,
} from '@/types/game'
import { getSegmentScore } from './x01'

export const getSkovhuggerController = (
  game: GameExtended
): GameController<GameState> => {
  return {
    ...getGenericController(game),

    getGameState() {
      const gameState = simulateSkovhugger(game)
      return {
        ...gameState,

        getUserResultText(userId) {
          const name = useUsersStore().getName(userId)
          const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          return `${name}, ${score}`
        },

        getUserDisplayText(userId) {
          const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          return `${score}`
        },

        getTopRightText() {
          const rounds = [
            '13',
            '14',
            'Double',
            '15',
            '16',
            'Triple',
            '17',
            '18',
            '41',
            '19',
            '20',
            'Bull',
          ]
          if (gameState.visitIndex >= rounds.length) return ''
          return 'Round: ' + rounds[gameState.visitIndex]
        },
      }
    },

    speakVisit(visit, leg) {
      const score = getSkovhuggerVisitScore(visit, leg.visits.length - 1)
      if (!score) speak('No score!')
      else speak(`${score}!`)
    },
  }
}

const simulateSkovhugger = (game: Game) => {
  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    result: [],
    forcedCompleted: [],
  }

  while (true) {
    state = nextState(game.players, state)
    if (!state.player) {
      break // all players have finished
    }

    if (state.visitIndex == 12) {
      state.result.push(state.player)
      state.result.sort(
        (a, b) =>
          getSkovhuggerScore(getVisitsOfUser(game, b)) -
          getSkovhuggerScore(getVisitsOfUser(game, a))
      )
      continue
    }

    const visit = getVisitsOfUser(game, state.player).at(state.visitIndex)
    if (!visit) break

    if (visit.includes(null)) break
  }

  return {
    ...state,
    playersLeft: game.players.filter(
      (p) => !state.result.includes(p) && !state.forcedCompleted.includes(p)
    ),
  }
}

const targets = {
  0: (s) => s.sector == 13,
  1: (s) => s.sector == 14,
  2: (s) => s.multiplier == Multiplier.Double,
  3: (s) => s.sector == 15,
  4: (s) => s.sector == 16,
  5: (s) => s.multiplier == Multiplier.Triple,
  6: (s) => s.sector == 17,
  7: (s) => s.sector == 18,
  8: () => true,
  9: (s) => s.sector == 19,
  10: (s) => s.sector == 20,
  11: (s) => s.sector == 25,
} as Record<number, (s: Segment) => boolean>

export const getSkovhuggerScore = (visits: Visit[]) => {
  let score = 0

  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i]
    const visitScore = getSkovhuggerVisitScore(visit, i)
    if (visitScore > 0) {
      score += visitScore
    } else {
      if (visit.includes(null)) {
        return score
      }
      score = Math.ceil(score / 2)
    }
  }

  return score
}

const getSkovhuggerVisitScore = (visit: Visit, visitIndex: number) => {
  let score = 0

  if (!(visitIndex in targets)) {
    return 0
  }

  for (const s of visit) {
    if (isSegment(s) && targets[visitIndex](s)) {
      score += getSegmentScore(s)
    }
  }

  if (visitIndex == 8 && score != 41) {
    score = 0
  }

  return score
}
