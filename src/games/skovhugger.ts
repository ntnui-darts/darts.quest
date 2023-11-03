import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Multiplier,
  Segment,
  Visit,
  getVisitsOfUser,
} from '@/types/game'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { getSegmentScore } from './x01'

export const getSkovhuggerController = (game: Game): GameController => {
  return {
    ...getGenericController(game),

    getGameState() {
      const gameState = simulateSkovhugger(game)
      return {
        ...gameState,

        getUserResultText(userId) {
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          return `${name}, ${score}`
        },

        getUserDisplayText(userId) {
          const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          return `${score}`
        },

        getTitleSuffix() {
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
          return ', Round: ' + rounds[gameState.visitIndex]
        },
      }
    },
  }
}

const simulateSkovhugger = (game: Game) => {
  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    rank: [],
  }

  while (true) {
    state = nextState(game.players, state)
    if (!state.player) {
      break // all players have finished
    }

    if (state.visitIndex == 12) {
      state.rank.push(state.player)
      state.rank.sort(
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
    playersLeft: game.players.filter((p) => !state.rank.includes(p)),
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
    let subscore = 0

    if (!(i in targets) || visit.includes(null)) {
      break
    }

    for (const s of visit) {
      if (s && targets[i](s)) {
        subscore += getSegmentScore(s)
      }
    }
    switch (i) {
      case 8:
        if (subscore != 41) {
          subscore = 0
        }
        break
    }
    if (subscore > 0) {
      score += subscore
    } else {
      score = Math.ceil(score / 2)
    }
  }

  return score
}
