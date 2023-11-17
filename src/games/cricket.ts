import { Game, GameController, GameState, getVisitsOfUser } from '@/types/game'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { useUsersStore } from '@/stores/users'

export interface CricketGameState extends GameState {
  players: { id: string; score: number; hits: Map<number, number> }[]
  unlocks: Map<number, number>
}

export const getCricketController = (game: Game): GameController => {
  return {
    ...getGenericController(game),

    getGameState(): CricketGameState {
      const gameState = simulateCricket(game)
      return {
        ...gameState,

        getUserResultText(userId) {
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const score =
            gameState.players.find((p) => p.id == userId)?.score ?? 0
          return `${name}, ${score}`
        },

        getUserDisplayText(userId) {
          const score =
            gameState.players.find((p) => p.id == userId)?.score ?? 0
          return `${score}`
        },

        getTopRightText() {
          return ''
        },
      }
    },

    speakVisit() {},
  }
}

const simulateCricket = (game: Game) => {
  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    rank: [],
  }

  const sectors = [15, 16, 17, 18, 19, 20, 25]
  const unlocks = new Map<number, number>()
  const players = game.players.map((id) => ({
    id,
    score: 0,
    hits: new Map<number, number>(),
  }))
  const playersLeft = () => players.filter((p) => !state.rank.includes(p.id))

  while (true) {
    state = nextState(game.players, state)
    const player = players.find((p) => p.id == state.player)
    if (!player) {
      break // all players have finished
    }

    if (state.rank.length >= players.length - 1) {
      state.rank.push(player.id)
      break
    }

    const visit = getVisitsOfUser(game, player.id).at(state.visitIndex)
    if (!visit) break

    for (const segment of visit) {
      if (segment == null) continue

      const prevHits = player.hits.get(segment.sector) ?? 0
      const totalHits = prevHits + segment.multiplier
      player.hits.set(segment.sector, totalHits)
      if (prevHits < 3) {
        if (totalHits >= 3) {
          unlocks.set(segment.sector, (unlocks.get(segment.sector) ?? 0) + 1)
        }
        continue
      }
      if ((unlocks.get(segment.sector) ?? 0) == players.length) continue
      player.score += segment.sector * segment.multiplier
    }

    if (sectors.every((s) => (unlocks.get(s) ?? 0) == players.length)) {
      state.rank = players
        .toSorted((a, b) => b.score - a.score)
        .map((p) => p.id)
      break
    }

    if (
      sectors.every((s) => (player.hits.get(s) ?? 0) >= 3) &&
      player.score == Math.max(...playersLeft().map((p) => p.score))
    ) {
      state.rank.push(player.id)
      continue
    }

    if (visit.includes(null)) break
  }

  return {
    ...state,
    playersLeft: game.players.filter((p) => !state.rank.includes(p)),
    players,
    unlocks,
  }
}
