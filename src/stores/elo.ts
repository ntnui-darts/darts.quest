import type { GameType } from '@/games/games'
import { supabase } from '@/supabase'
import type { Game, GameState } from '@/types/game'
import { Database } from '@/types/supabase'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'

export const initialElo = 1000
const k = 32

const getExpectedResult = (player: number, other: number) => {
  return 1 / (1 + Math.pow(10, (other - player) / 400))
}

const getEloDelta = (expectedResult: number, actualResult: number) => {
  return k * (actualResult - expectedResult)
}

type EloRow = Omit<Database['public']['Tables']['elo']['Row'], 'id'>
type UserId = string

export const useEloStore = defineStore('elo', {
  state: () => ({
    personalElo: null as EloRow | null,
    userDisplayElos: new Map<UserId, EloRow>(),
  }),

  actions: {
    async updateEloFromGame(
      game: Game,
      upsert: boolean,
      gameState?: GameState | null
    ) {
      const eloPlayers: { id: string; elo: number }[] = []

      for (const id of game.players) {
        const elo = await this.fetchElo(id, game.type)
        eloPlayers.push({ id, elo })
      }
      const eloDeltas: { userId: string; eloDelta: number }[] = []
      for (const player of eloPlayers) {
        let eloDelta = 0
        for (const other of eloPlayers) {
          if (player.id == other.id) continue
          const index = game.result.indexOf(player.id)
          const otherIndex = game.result.indexOf(other.id)
          let result = 0
          if (index == -1 && otherIndex == -1) {
            if (!gameState) continue
            const playerResigned = gameState.resignees.includes(player.id)
            const otherResigned = gameState.resignees.includes(other.id)
            if (!playerResigned && otherResigned) {
              result = 1
            }
          } else {
            if (game.type == 'killer') {
              if (index < otherIndex) result = 1
              else if (otherIndex == -1) result = 0
              else if (index == -1) result = 1
            } else {
              if (index < otherIndex) result = 1
              if (otherIndex == -1) result = 1
              if (index == -1) result = 0
            }
          }
          const expected = getExpectedResult(player.elo, other.elo)
          eloDelta += getEloDelta(expected, result)
        }
        eloDelta /= Math.max(1, eloPlayers.length - 1)
        if (eloDelta != 0 && upsert) {
          await this.upsertElo(player.id, game.type, player.elo + eloDelta)
        }
        eloDeltas.push({
          userId: player.id,
          eloDelta,
        })
      }
      return eloDeltas
    },

    async fetchElo(userId: string, gameType: GameType): Promise<number> {
      if (!useUsersStore()._users.some((u) => u.id == userId)) return initialElo

      const eloResponse = await supabase
        .from('elo')
        .select('*')
        .eq('id', userId)
      const elo = eloResponse.data?.[0]
      if (elo && gameType in elo) {
        this.userDisplayElos.set(userId, elo)
        // @ts-ignore
        return (elo[gameType] ?? initialElo) as number
      }
      return initialElo
    },

    async upsertElo(userId: string, gameType: GameType, elo: number) {
      if (!useUsersStore()._users.some((u) => u.id == userId)) return

      await supabase.from('elo').upsert({
        id: userId,
        [gameType]: elo,
        lastUpdate: new Date().toISOString(),
      })
    },

    async fetchPersonalElo() {
      const userId = useAuthStore().auth?.id
      if (!userId) return
      const eloResponse = await supabase
        .from('elo')
        .select('*')
        .eq('id', userId)
      if (eloResponse.data?.length) {
        this.personalElo = eloResponse.data[0]
      }
    },
  },

  getters: {
    getDisplayElo() {
      return (userId: string, gameType: GameType) => {
        const userElo = this.userDisplayElos.get(userId)?.[gameType]
        return userElo ? Math.round(userElo) : initialElo
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEloStore, import.meta.hot))
}
