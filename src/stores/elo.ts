import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Game } from '@/types/game'
import type { GameType } from '@/games/games'
import { supabase } from '@/supabase'

export const initialElo = 1000
const k = 32

const getExpectedResult = (player: number, other: number) => {
  return 1 / (1 + Math.pow(10, (other - player) / 400))
}

const getEloDelta = (expectedResult: number, actualResult: number) => {
  return k * (actualResult - expectedResult)
}

export const useEloStore = defineStore('elo', {
  state: () => ({}),

  actions: {
    async updateEloFromGame(game: Game) {
      const eloPlayers: { id: string; elo: number }[] = []

      for (const id of game.players) {
        const elo = await this.getElo(id, game.type)
        eloPlayers.push({ id, elo })
      }
      const eloDeltas: { userId: string; eloDelta: number }[] = []
      for (const player of eloPlayers) {
        let eloDelta = 0
        for (const other of eloPlayers) {
          if (player.id == other.id) continue
          const index = game.result.indexOf(player.id)
          const otherIndex = game.result.indexOf(other.id)
          if (index == -1 && otherIndex == -1) continue
          let result = 0
          if (index < otherIndex) result = 1
          if (otherIndex == -1) result = 1
          if (index == -1) result = 0
          const expected = getExpectedResult(player.elo, other.elo)
          eloDelta += getEloDelta(expected, result)
        }
        eloDelta /= Math.max(1, eloPlayers.length - 1)
        if (eloDelta != 0) {
          await this.setElo(player.id, game.type, player.elo + eloDelta)
        }
        eloDeltas.push({
          userId: player.id,
          eloDelta,
        })
      }
      return eloDeltas
    },

    async getElo(userId: string, gameType: GameType) {
      const eloResponse = await supabase
        .from('elo')
        .select(gameType)
        .eq('id', userId)
      const elo = eloResponse.data?.[0]
      if (elo && gameType in elo) {
        // @ts-ignore
        return (elo[gameType] ?? initialElo) as number
      }
      return initialElo
    },

    async setElo(userId: string, gameType: GameType, elo: number) {
      await supabase.from('elo').upsert({ id: userId, [gameType]: elo })
    },
  },

  getters: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEloStore, import.meta.hot))
}
