import { speak } from '@/functions/speak'
import {
  SimulationState,
  getGenericController,
  nextState,
} from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  GameController,
  GameExtended,
  GameState,
  Multiplier,
  getVisitsOfUser,
  isSegment,
} from '@/types/game'
import { getGamePoints } from './games'

export type KillerController = GameController<GameState>

export type KillerPlayer = {
  userId: string
  sector: number | null
  points: number
}

export const getKillerController = (game: GameExtended): KillerController => {
  const gameStore = useGameStore()

  if (!game.extension || game.extension.kind != 'killer') {
    game.extension = {
      kind: 'killer',
      killers: game.players.map((userId) => ({
        userId,
        sector: null,
        points: 0,
      })),
    }
  }

  return {
    ...getGenericController(game),

    getGameState() {
      const gameState = simulateKiller(game)
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
      if (!game.extension || game.extension.kind != 'killer') throw Error()
      const killers = game.extension.killers

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
      if (!game.extension || game.extension.kind != 'killer') throw Error()
      const killers = game.extension.killers

      const player = killers.find(
        (p) => p.userId == gameStore.gameState?.player
      )
      if (!player) throw Error()
      if (!player.sector) {
        return
      }

      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },

    speakVisit(visit) {
      if (game.extension?.kind != 'killer') throw new Error()
      const userStore = useUsersStore()

      let text = ''
      for (const segment of visit) {
        if (!isSegment(segment)) continue

        const player = game.extension.killers.find(
          (k) => k.sector == segment.sector
        )
        if (player) {
          const name = userStore.getName(player.userId)
          text += ` ${segment.multiplier} on ${name}`
        }
      }

      if (text.length == 0) {
        speak('No score!')
      } else {
        speak(text)
      }
    },
  }
}

const simulateKiller = (game: GameExtended) => {
  if (!game.extension || game.extension.kind != 'killer') throw Error()
  const killers = game.extension.killers

  killers.forEach((k) => (k.points = 0))

  for (let i = 0; i < killers.length; i++) {
    if (!killers[i].sector) {
      return {
        player: killers[i].userId,
        prevPlayer: null,
        result: [],
        forcedCompleted: [],
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
    forcedCompleted: [],
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

      if (!isSegment(segment)) break
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
      (p) => !state.result.includes(p) && !state.forcedCompleted.includes(p)
    ),
  }
}
