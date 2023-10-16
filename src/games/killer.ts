import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import { Game, GameController, Multiplier, getVisitsOfUser } from '@/types/game'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { getGamePoints } from './games'

export type KillerController = GameController & {
  getKillerPlayers: () => KillerPlayer[]
}

export type KillerPlayer = {
  userId: string
  sector: number | null
  points: number
}

export const getKillerController = (game: Game): KillerController => {
  const gameStore = useGameStore()
  const killers: KillerPlayer[] = game.players.map((userId) => ({
    userId,
    sector: null,
    points: 0,
  }))
  return {
    ...getGenericController(game),

    getKillerPlayers() {
      return killers
    },

    getGameState() {
      const gameState = simulateKiller(game, killers)
      return {
        ...gameState,

        getUserResultText(userId) {
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const player = gameState.killers.find((p) => p.userId == userId)
          return `${name}, ${player?.points} points`
        },

        getUserDisplayText(userId) {
          const player = gameState.killers.find((p) => p.userId == userId)
          if (!player) return '-'
          return `${player.points}\t[${player.sector ?? '?'}]`
        },
      }
    },

    recordHit(segment) {
      const player = killers.find(
        (p) => p.userId == gameStore.gameState?.player
      )
      if (!player) throw Error()
      const playerHit = killers.find((p) => p.sector == segment.sector)
      if (!player.sector) {
        if (playerHit) {
          return // sector already taken
        }
        player.sector = segment.sector
        gameStore.updateGameState()
        return
      }
      gameStore.saveScore(segment)
    },

    recordMiss() {
      const player = killers.find(
        (p) => p.userId == gameStore.gameState?.player
      )
      if (!player) throw Error()
      if (!player.sector) {
        return
      }

      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

export const simulateKiller = (game: Game, killers: KillerPlayer[]) => {
  killers.forEach((k) => (k.points = 0))

  for (let i = 0; i < killers.length; i++) {
    if (!killers[i].sector) {
      return {
        player: killers[i].userId,
        prevPlayer: null,
        rank: [],
        playersLeft: killers.map((p) => p.userId),
        killers,
      }
    }
  }

  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    rank: [],
  }
  const gamePoints = getGamePoints(game)
  const players = killers
    .toSorted((a, b) => (b.sector ?? 0) - (a.sector ?? 0))
    .map((k) => k.userId)

  while (true) {
    state = nextState(players, state)
    if (!state.player) {
      break // all players have finished
    }
    const killersLeft = () =>
      killers.filter((k) => !state.rank.includes(k.userId))
    const killer = killersLeft().find((k) => k.userId == state.player)
    if (!killer) {
      throw Error()
    }

    const visit = getVisitsOfUser(game, state.player).at(state.visitIndex)
    if (!visit) break

    for (const segment of visit) {
      if (!segment) break
      const playerHit = killersLeft().find((p) => p.sector == segment.sector)
      if (!playerHit) continue

      if (state.player == playerHit.userId) {
        playerHit.points += segment.multiplier

        if (playerHit.points > gamePoints) {
          state.rank.unshift(state.player)
          break
        } else if (playerHit.points == gamePoints) {
          killersLeft().forEach((k) => {
            if (k.points == 0) {
              state.rank.unshift(k.userId)
            }
          })
        }
      } else if (killer.points == gamePoints) {
        playerHit.points -= segment.multiplier

        if (playerHit.points <= 0) {
          state.rank.unshift(playerHit.userId)
        }
      }
    }

    if (state.rank.length >= players.length - 1) {
      state.rank.unshift(state.player)
      continue
    }

    if (state.rank.includes(state.player)) continue

    if (visit.includes(null)) break
  }

  return {
    ...state,
    killers,
    playersLeft: players.filter((p) => !state.rank.includes(p)),
  }
}
