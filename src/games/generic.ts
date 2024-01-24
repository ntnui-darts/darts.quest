import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
  GameState,
  Multiplier,
  Visit,
  getVisitsOfUser,
  multiplierToString,
} from '@/types/game'

export const getGenericController = (game: Game) => {
  return {
    game,

    getSegmentText(segment) {
      if (!segment) return '-'
      if (!segment.multiplier || segment.multiplier == 1)
        return segment.sector.toString()
      return `${multiplierToString(segment.multiplier)} x ${segment.sector}`
    },

    recordHit(segment) {
      if (!segment) return
      useGameStore().saveScore(segment)
    },

    recordMiss() {
      useGameStore().saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  } satisfies Partial<GameController<GameState>>
}

export type SimulationState = {
  prevPlayer: null | string
  player: null | string
  visitIndex: number
  rank: string[]
}

export const nextState = (
  players: string[],
  prevState: SimulationState,
  prevIndex: number | null = null
): SimulationState => {
  const state = { ...prevState }
  if (!state.player)
    return {
      prevPlayer: null,
      player: players[0],
      visitIndex: 0,
      rank: [],
    }
  state.prevPlayer = state.player
  if (state.rank.length == players.length) {
    state.player = null
    return state
  }

  const index = prevIndex ?? players.indexOf(state.player)
  const nextIndex = (index + 1) % players.length
  if (nextIndex == 0) state.visitIndex += 1
  const nextPlayer = players[nextIndex]

  if (state.rank.includes(nextPlayer)) {
    return nextState(players, state, nextIndex)
  }
  state.player = players[nextIndex]
  return state
}

export const simulateFirstToWinGame = (
  game: Game,
  winCondition: (game: Game, visits: Visit[]) => boolean
) => {
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
    const allVisits = getVisitsOfUser(game, state.player)
    const visits = allVisits.slice(0, state.visitIndex + 1)

    if (winCondition(game, visits)) {
      state.rank.push(state.player)
      continue
    }

    const visit = allVisits.at(state.visitIndex)
    if (!visit || visit.includes(null)) break
  }

  return {
    ...state,
    playersLeft: game.players.filter((p) => !state.rank.includes(p)),
  }
}
