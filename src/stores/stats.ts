import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'

export type UserStat = Database['public']['Tables']['statistics']['Row']

export const useStatsStore = defineStore('stats', {
  state: () => ({
    legs: [] as Leg[],
    games: [] as DbGame[],
    userStats: [] as UserStat[],
  }),

  actions: {
    async fetchAll() {
      await this.fetchGames()
      await this.fetchLegs()
      await this.refreshPersonalStats()
      await this.fetchUserStats()
    },
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
    async fetchUserStats() {
      const userStats = await supabase.from('statistics').select('*')
      if (userStats.data) {
        this.userStats = userStats.data
      }
    },
    async refreshPersonalStats() {
      const userId = useAuthStore().auth?.id
      if (!userId) throw Error()
      let longestRtcStreak = 0
      this.legs.forEach((leg) => {
        if (leg.type != 'rtc') return
        let currentRtcStreak = 0
        leg.visits.flat().forEach((s) => {
          if (s != null && s.sector != 0) {
            currentRtcStreak += 1
            longestRtcStreak = Math.max(longestRtcStreak, currentRtcStreak)
          } else {
            currentRtcStreak = 0
          }
        })
      })
      const userStat = await supabase
        .from('statistics')
        .select('*')
        .eq('userId', userId)
      if (!userStat.data?.length) {
        await supabase
          .from('statistics')
          .insert({ userId, rtcStreak: longestRtcStreak })
      } else {
        await supabase
          .from('statistics')
          .update({ rtcStreak: longestRtcStreak })
          .eq('userId', userId)
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
