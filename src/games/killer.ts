import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameState,
  Multiplier,
  getVisitsOfUser,
} from '@/types/game'
import { getGamePoints } from './games'

export type KillerController = GameController<GameState> & {
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
          const name = useUsersStore().getName(userId)
          const player = gameState.killers.find((p) => p.userId == userId)
          return `${name}, ${player?.points} points`
        },

        getUserDisplayText(userId) {
          const player = gameState.killers.find((p) => p.userId == userId)
          if (!player) return '-'
          return `${player.points}\t[${player.sector ?? '?'}]`
        },

        getTopRightText() {
          return ''
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
        gameStore.refreshGameState()
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

    speakVisit() {},
  }
}

const simulateKiller = (game: Game, killers: KillerPlayer[]) => {
  killers.forEach((k) => (k.points = 0))

  for (let i = 0; i < killers.length; i++) {
    if (!killers[i].sector) {
      return {
        player: killers[i].userId,
        prevPlayer: null,
        result: [],
        resignees: [],
        playersLeft: killers.map((p) => p.userId),
        killers,
      }
    }
  }

  let state: SimulationState = {
    player: null,
    prevPlayer: null,
    visitIndex: 0,
    result: [],
    resignees: [],
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
      killers.filter((k) => !state.result.includes(k.userId))
    const killer = killersLeft().find((k) => k.userId == state.player)
    if (!killer) {
      throw Error()
    }

    const winIfAlone = () => {
      if (
        state.player &&
        !state.result.includes(state.player) &&
        state.result.length >= players.length - 1
      ) {
        state.result.unshift(state.player)
        return true
      }
      return false
    }

    const visit = getVisitsOfUser(game, state.player).at(state.visitIndex)
    if (winIfAlone() || !visit) break

    for (const segment of visit) {
      if (winIfAlone()) break

      if (!segment || segment == 'resigned') break
      const playerHit = killersLeft().find((p) => p.sector == segment.sector)
      if (!playerHit) continue

      if (state.player == playerHit.userId) {
        playerHit.points += segment.multiplier

        if (playerHit.points > gamePoints) {
          state.result.unshift(state.player)
          break
        } else if (playerHit.points == gamePoints) {
          killersLeft().forEach((k) => {
            if (k.points == 0) {
              state.result.unshift(k.userId)
            }
          })
        }
      } else if (killer.points == gamePoints) {
        playerHit.points -= segment.multiplier

        if (playerHit.points <= 0) {
          state.result.unshift(playerHit.userId)
        }
      }
    }

    winIfAlone()
    if (state.result.includes(state.player)) continue

    if (visit.includes(null)) break
  }

  return {
    ...state,
    killers,
    playersLeft: players.filter(
      (p) => !state.result.includes(p) && !state.resignees.includes(p)
    ),
  }
}
