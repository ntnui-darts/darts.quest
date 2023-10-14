import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import { Game, GameController, Multiplier, getVisitsOfUser } from '@/types/game'
import { getGenericController, getSegmentText } from '@/games/generic'
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
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const player = gameState.allPlayers.find((p) => p.userId == userId)
          return `${name}, ${player?.points} points`
        },
        getUserDisplayText(userId) {
          const player = gameState.allPlayers.find((p) => p.userId == userId)
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
  const allPlayers = _players.toSorted(
    (a, b) => (b.sector ?? 0) - (a.sector ?? 0)
  )
  allPlayers.map((p) => (p.points = 0))
  const playersLeft = [...allPlayers]
  let visitIndex = 0
  const gamePoints = getGamePoints(game)
  let userId: null | string = null
  let prevUserId: null | string = null

  for (let i = 0; i < allPlayers.length; i++) {
    if (!allPlayers[i].sector) {
      return {
        userId: allPlayers[i].userId,
        results,
        allPlayers,
        prevUserId,
        playersLeft: allPlayers.map((p) => p.userId),
      }
    }
    prevUserId = allPlayers[i].userId
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

      if (results.length == allPlayers.length - 1) {
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
  return {
    results,
    userId,
    allPlayers,
    prevUserId,
    playersLeft: allPlayers
      .map((p) => p.userId)
      .filter((id) => !results.includes(id)),
  }
}
