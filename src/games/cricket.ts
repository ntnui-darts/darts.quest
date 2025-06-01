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
  getVisitsOfUser,
  isSegment,
} from '@/types/game'

type CricketPlayer = {
  id: string
  score: number
  scorePrev: number
  hits: Map<number, number>
}
export interface CricketGameState extends GameState {
  players: CricketPlayer[]
  unlocks: Map<number, number>
}

export const getCricketController = (
  game: GameExtended
): GameController<CricketGameState> => {
  return {
    ...getGenericController(game),

    getGameState(): CricketGameState {
      const gameState = simulateCricket(game)
      return {
        ...gameState,

        getUserResultText(userId) {
          const name = useUsersStore().getName(userId)
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

    speakVisit(visit, leg) {
      const hits = visit.filter(
        (s) =>
          s != null && s != 'resigned' && typeof s != 'number' && s.sector > 0
      ).length
      let text = `${hits} hits`

      const gameState = this.getGameState()
      const player = gameState.players.find((p) => p.id == leg.userId)
      if (!player) throw Error()
      if (player.score > player.scorePrev) {
        text += `, scored ${player.score - player.scorePrev}!`
      }
      speak(text)
    },
  }
}

const simulateCricket = (game: Game) => {
  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    result: [],
    resignees: [],
  }

  const sectors = [15, 16, 17, 18, 19, 20, 25]
  const unlocks = new Map<number, number>()
  const players: CricketPlayer[] = game.players.map((id) => ({
    id,
    score: 0,
    scorePrev: 0,
    hits: new Map<number, number>(),
  }))
  const playersLeft = () =>
    players.filter(
      (p) => !state.result.includes(p.id) && !state.resignees.includes(p.id)
    )

  while (true) {
    state = nextState(game.players, state)
    const player = players.find((p) => p.id == state.player)
    if (!player) {
      break // all players have finished
    }

    if (state.result.length >= players.length - 1) {
      state.result.push(player.id)
      break
    }

    const visit = getVisitsOfUser(game, player.id).at(state.visitIndex)
    if (!visit) break

    player.scorePrev = player.score

    for (const segment of visit) {
      if (!isSegment(segment)) continue

      const prevHits = player.hits.get(segment.sector) ?? 0
      const totalHits = prevHits + segment.multiplier
      player.hits.set(segment.sector, totalHits)
      if (prevHits < 3 && totalHits >= 3) {
        unlocks.set(segment.sector, (unlocks.get(segment.sector) ?? 0) + 1)
      }
      if (
        (unlocks.get(segment.sector) ?? 0) == players.length ||
        totalHits < 3
      ) {
        continue
      }
      const multiplier =
        prevHits >= 3 ? segment.multiplier : segment.multiplier - (3 - prevHits)
      if (multiplier > 0) {
        player.score += segment.sector * multiplier
      }
    }

    if (sectors.every((s) => (unlocks.get(s) ?? 0) == players.length)) {
      state.result = players
        .toSorted((a, b) => b.score - a.score)
        .map((p) => p.id)
      break
    }

    if (
      sectors.every((s) => (player.hits.get(s) ?? 0) >= 3) &&
      player.score == Math.max(...playersLeft().map((p) => p.score))
    ) {
      state.result.push(player.id)
      continue
    }

    if (visit.includes(null)) break
  }

  return {
    ...state,
    playersLeft: game.players.filter(
      (p) => !state.result.includes(p) && !state.resignees.includes(p)
    ),
    players,
    unlocks,
  }
}
