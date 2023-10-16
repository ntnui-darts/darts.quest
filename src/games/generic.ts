import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
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
  } satisfies Partial<GameController>
}

type State = {
  prevPlayer: null | string
  player: null | string
  visitIndex: number
}
export const getResultsOfFirstToWinGame = (
  game: Game,
  winCondition: (game: Game, visits: Visit[]) => boolean
) => {
  const results: string[] = []
  const players = [...game.players]
  let state: State = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
  }
  const nextState = (prevState: State): State => {
    const state = { ...prevState }
    if (!state.player)
      return {
        prevPlayer: null,
        player: players[0],
        visitIndex: 0,
      }
    if (results.length == players.length) {
      state.player = null
      return state
    }
    state.prevPlayer = state.player
    const index = players.indexOf(state.player)
    const nextIndex = (index + 1) % players.length
    if (nextIndex == 0) state.visitIndex += 1
    state.player = players[nextIndex]
    if (results.includes(state.player)) {
      return nextState(state)
    }
    return state
  }

  while (true) {
    state = nextState(state)
    if (!state.player) {
      break // all players have finished
    }
    const allVisits = getVisitsOfUser(game, state.player)
    const visits = allVisits.slice(0, state.visitIndex + 1)

    if (winCondition(game, visits)) {
      results.push(state.player)
      continue
    }

    const visit = allVisits.at(state.visitIndex)
    if (!visit || visit.includes(null)) break
  }

  return {
    results,
    userId: state.player,
    prevUserId: state.prevPlayer,
    playersLeft: game.players.filter((p) => !results.includes(p)),
  }
}
