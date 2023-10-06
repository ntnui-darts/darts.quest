import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg } from './game'
import { useAuthStore } from './auth'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    legs: [] as Leg[],
    games: [] as DbGame[],
  }),

  actions: {
    async fetchLegs() {
      const id = useAuthStore().auth?.id
      if (!id) return
      const legs = await supabase.from('legs').select('*').eq('userId', id)
      if (legs.data) {
        this.legs = (legs.data as Leg[]).toSorted(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }
    },
    async fetchGames() {
      const id = useAuthStore().auth?.id
      if (!id) return
      const games = await supabase
        .from('games')
        .select('*')
        .contains('players', [id])
      if (games.data) {
        this.games = games.data.toSorted(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }
    },
  },

  getters: {
    getNumberOfWins: (state) => {
      return state.games.filter(
        (game) =>
          game.players.length > 1 &&
          game.result.length > 0 &&
          game.result[0] == useAuthStore().auth?.id
      ).length
    },
    getNumberOfLosses: (state) => {
      return state.games.filter(
        (game) =>
          game.players.length > 1 &&
          game.result.length > 0 &&
          game.result[0] != useAuthStore().auth?.id
      ).length
    },
    getNumberOfSoloGames: (state) => {
      return state.games.filter((game) => game.players.length < 2).length
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
