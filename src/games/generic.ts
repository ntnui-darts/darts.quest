import { useGameStore } from '@/stores/game'
import {
  ForcedCompletion,
  Game,
  GameController,
  GameExtended,
  GameState,
  MaybeSegment,
  Multiplier,
  Visit,
  getVisitsOfUser,
  isForcedCompletion,
  isSegment,
  multiplierToString,
} from '@/types/game'

export const getSegmentText = (
  segment?: MaybeSegment,
  hideMultiplier: boolean = false
) => {
  if (isForcedCompletion(segment)) return segment.reason
  if (!isSegment(segment)) return '-'
  if (!segment.multiplier || segment.multiplier == 1 || hideMultiplier)
    return segment.sector.toString()
  return `${multiplierToString(segment.multiplier)} x ${segment.sector}`
}

export const getGenericController = (game: GameExtended) => {
  return {
    game,

    getSegmentText: getSegmentText,

    recordHit(segment) {
      if (!segment) return
      useGameStore().saveScore(segment)
    },

    recordMiss() {
      useGameStore().saveScore({ multiplier: Multiplier.None, sector: 0 })
    },

    recordResign() {
      useGameStore().saveScore({ reason: 'resigned', value: 0 })
    },
  } satisfies Partial<GameController<GameState>>
}

export type SimulationState = {
  prevPlayer: null | string
  player: null | string
  visitIndex: number
  result: string[]
  forcedCompleted: string[]
}

export const nextState = (
  players: string[],
  prevState: SimulationState,
  prevIndex: number | null = null
): SimulationState => {
  const state = { ...prevState }
  if (!state.player)
    // return initial state
    return {
      prevPlayer: null,
      player: players[0],
      visitIndex: 0,
      result: [],
      forcedCompleted: [],
    }
  state.prevPlayer = state.player
  if (state.result.length + state.forcedCompleted.length >= players.length) {
    state.player = null
    return state
  }

  const index = prevIndex ?? players.indexOf(state.player)
  const nextIndex = (index + 1) % players.length
  if (nextIndex == 0) {
    state.visitIndex += 1
  }
  const nextPlayer = players[nextIndex]

  if (
    state.result.includes(nextPlayer) ||
    state.forcedCompleted.includes(nextPlayer)
  ) {
    return nextState(players, state, nextIndex)
  }
  state.player = players[nextIndex]
  return state
}

export const simulateFirstToWinGame = (
  game: Game,
  winCondition: (game: Game, visits: Visit[]) => boolean,
  sortResult?: (a: string, b: string) => number
) => {
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
    const allVisits = getVisitsOfUser(game, state.player)
    const visits = allVisits.slice(0, state.visitIndex + 1)

    if (winCondition(game, visits)) {
      state.result.push(state.player)
      if (sortResult) {
        state.result.sort(sortResult)
      }

      continue
    }

    const visit = allVisits.at(state.visitIndex)

    if (visit?.some((s) => s == 'resigned' || isForcedCompletion(s))) {
      state.forcedCompleted.push(state.player)
      continue // TODO: FIX FOR FORCED RTC
    }

    if (!visit || visit.includes(null)) break
  }

  // find and sort players with forcedCompletion: max-visits
  const maxVisitedPlayers = (
    state.forcedCompleted
      .map((player) => {
        const forcedCompletion = getVisitsOfUser(game, player)
          .flat()
          .find((s) => isForcedCompletion(s) && s.reason == 'max-visits')
        return { player, forcedCompletion }
      })
      .filter(({ forcedCompletion }) => !!forcedCompletion) as {
      player: string
      forcedCompletion: ForcedCompletion
    }[]
  ).toSorted((a, b) => a.forcedCompletion.value - b.forcedCompletion.value)
  // add these players to result and remove them from forcedCompleted
  maxVisitedPlayers.forEach(({ player }) => {
    state.result.push(player)
  })
  state.forcedCompleted = state.forcedCompleted.filter(
    (p) => !maxVisitedPlayers.find(({ player }) => player == p)
  )

  return {
    ...state,
    playersLeft: game.players.filter(
      (p) => !state.result.includes(p) && !state.forcedCompleted.includes(p)
    ),
  }
}
