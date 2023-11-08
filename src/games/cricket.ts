import { Game, GameController, getVisitsOfUser } from '@/types/game'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'

export const getCricketController = (game: Game): GameController => {
  return {
    ...getGenericController(game),

    getGameState() {
      const gameState = simulateCricket(game)
      return {
        ...gameState,

        getUserResultText(userId) {
          //   const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          //   const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          //   return `${name}, ${score}`
          return ''
        },

        getUserDisplayText(userId) {
          //   const score = getSkovhuggerScore(getVisitsOfUser(game, userId))
          //   return `${score}`
          return ''
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
      //   const score = getSkovhuggerVisitScore(visit, leg.visits.length - 1)
      //   if (!score) speak('No score!')
      //   else speak(`${score}!`)
    },
  }
}

const simulateCricket = (game: Game) => {
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

    const visit = getVisitsOfUser(game, state.player).at(state.visitIndex)
    if (!visit) break

    if (visit.includes(null)) break
  }

  return {
    ...state,
    playersLeft: game.players.filter((p) => !state.rank.includes(p)),
  }
}
