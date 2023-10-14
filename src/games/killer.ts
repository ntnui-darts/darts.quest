import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import { Game, GameController, Multiplier, getGamePoints } from '@/types/game'
import { getGenericController } from '@/games/generic'

export type KillerController = GameController & {
  getKillerPlayers: () => KillerPlayer[]
}

type KillerPlayer = {
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
    winnerFinishesFirst() {
      return false
    },
    getKillerPlayers() {
      return _players.filter((player) => !game.result.includes(player.userId))
    },
    winCondition() {
      return this.getKillerPlayers().length == 1
    },
    getUserResultText(userId) {
      return useUsersStore().getUser(userId)?.name ?? 'Unknown'
    },
    getUserDisplayText(userId) {
      const player = this.getKillerPlayers().find((p) => p.userId == userId)
      if (!player) return '-'
      return `${player.points}\t[${player.sector ?? '?'}]`
    },
    recordHit(segment) {
      if (!segment) return
      const currentPlayer = this.getKillerPlayers().find(
        (p) => p.userId == gameStore.userId
      )
      if (!currentPlayer) throw Error()
      const playerHit = this.getKillerPlayers().find(
        (p) => p.sector == segment.sector
      )
      if (!currentPlayer.sector) {
        if (playerHit) {
          return
        }
        currentPlayer.sector = segment.sector
        gameStore.nextUser()
        return
      }

      if (!playerHit) return
      if (currentPlayer == playerHit) {
        playerHit.points += segment.multiplier
      } else if (currentPlayer.points == getGamePoints(game)) {
        playerHit.points -= segment.multiplier
      }
      if (
        playerHit.points > getGamePoints(game) ||
        (playerHit != currentPlayer && playerHit.points < 0)
      ) {
        game.result.unshift(playerHit.userId)
        const leg = game.legs.find((leg) => leg.userId == playerHit.userId)
        if (leg) {
          leg.finish = true
        }
        if (playerHit == currentPlayer) {
          gameStore.nextUser()
        }
      }

      if (currentPlayer.points == getGamePoints(game)) {
        this.getKillerPlayers()
          .filter((player) => player.points == 0)
          .forEach((player) => {
            game.result.unshift(player.userId)
            const leg = game.legs.find((leg) => leg.userId == player.userId)
            if (leg) {
              leg.finish = true
            }
          })
      }

      gameStore.saveScore(segment)
    },
    recordMiss() {
      const player = this.getKillerPlayers().find(
        (p) => p.userId == gameStore.userId
      )
      if (!player) throw Error()
      if (!player.sector) {
        return
      }

      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}
