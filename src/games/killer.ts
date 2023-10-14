import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Multiplier,
  getGamePoints,
  getVisitsOfUser,
} from '@/types/game'
import { getGenericController, getSegmentText } from '@/games/generic'

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
  const _players: KillerPlayer[] = game.players.map((userId) => ({
    userId,
    sector: null,
    points: 0,
  }))
  return {
    ...getGenericController(game),
    getKillerPlayers() {
      return _players
    },
    getGameState() {
      const gameState = getGameState(game, _players)
      return {
        getSegmentText,
        ...gameState,
        getUserResultText(userId) {
          return useUsersStore().getUser(userId)?.name ?? 'Unknown'
        },
        getUserDisplayText(userId) {
          const player = gameState.players.find((p) => p.userId == userId)
          if (!player) return '-'
          return `${player.points}\t[${player.sector ?? '?'}]`
        },
      }
    },
    recordHit(segment) {
      const player = _players.find(
        (p) => p.userId == gameStore.gameState?.userId
      )
      if (!player) throw Error()
      const playerHit = _players.find((p) => p.sector == segment.sector)
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
      const player = _players.find(
        (p) => p.userId == gameStore.gameState?.userId
      )
      if (!player) throw Error()
      if (!player.sector) {
        return
      }

      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

const getGameState = (game: Game, _players: KillerPlayer[]) => {
  const results: string[] = []
  const players = JSON.parse(JSON.stringify(_players)) as KillerPlayer[]
  const playersLeft = [...players]
  let visitIndex = 0
  const gamePoints = getGamePoints(game)
  let userId: null | string = null
  let prevUserId: null | string = null

  for (let i = 0; i < players.length; i++) {
    if (!players[i].sector) {
      return { userId: players[i].userId, results, players, prevUserId }
    }
    prevUserId = players[i].userId
  }
  prevUserId = null

  while (playersLeft.length) {
    for (let i = 0; i < playersLeft.length; i++) {
      const player = playersLeft[i]
      const visits = getVisitsOfUser(game, player.userId)
      const visit = visits.at(visitIndex)

      const kill = (p: KillerPlayer) => {
        results.unshift(p.userId)
        const index = playersLeft.indexOf(p)
        playersLeft.splice(index, 1)
        if (index <= i) i -= 1
      }

      if (results.length == players.length - 1) {
        kill(player)
        // TODO: Fix
        userId = player.userId
        prevUserId = player.userId
        break
      }

      if (!userId && visit?.some((s) => s == null)) userId = player.userId
      if (!userId) {
        prevUserId = player.userId
      }

      if (
        player.points == 0 &&
        playersLeft.some((p) => p.points == gamePoints)
      ) {
        kill(player)
        continue
      }

      if (!visit) {
        playersLeft.splice(i, 1)
        i -= 1
        continue
      }

      for (const segment of visit) {
        if (!segment) {
          break
        }
        const playerHit = playersLeft.find((p) => p.sector == segment.sector)

        if (!playerHit) continue

        if (player == playerHit) {
          playerHit.points += segment.multiplier

          if (playerHit.points > gamePoints) {
            kill(player)
          }
        } else if (player.points == gamePoints) {
          playerHit.points -= segment.multiplier

          if (playerHit.points < 0) {
            kill(playerHit)
          }
        }
      }
    }
    visitIndex += 1
  }
  return { results, userId, players, prevUserId }
}
