import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg, getTypeAttribute } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'
import { getX01VisitScore } from '@/games/x01'

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
      await this.recalculatePersonalStats()
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
    async recalculatePersonalStats() {
      const userId = useAuthStore().auth?.id
      if (!userId) throw Error()
      let maxRtcStreak = 0
      let minRtcVisits = null as number | null
      let min301DoubleVisits = null as number | null
      let maxX01VisitScore = 0
      this.legs
        .filter((leg) => leg.finish)
        .forEach((leg) => {
          switch (leg.type) {
            case 'rtc':
              minRtcVisits = Math.min(
                minRtcVisits ?? Infinity,
                leg.visits.length
              )
              let currentRtcStreak = 0
              leg.visits.flat().forEach((s) => {
                if (s != null && s.sector != 0) {
                  currentRtcStreak += 1
                  maxRtcStreak = Math.max(maxRtcStreak, currentRtcStreak)
                } else {
                  currentRtcStreak = 0
                }
              })
              break
            case 'x01':
              const finish = getTypeAttribute<number>(leg, 'finish', 1)
              if (finish == 2) {
                min301DoubleVisits = Math.min(
                  min301DoubleVisits ?? Infinity,
                  leg.visits.length
                )
              }
              maxX01VisitScore = Math.max(
                maxX01VisitScore,
                ...leg.visits.map((v) => getX01VisitScore(v))
              )
          }
        })
      const userStat = {
        maxRtcStreak,
        minRtcVisits,
        min301DoubleVisits,
        maxX01VisitScore,
      }
      const userStatPrev = await supabase
        .from('statistics')
        .select('*')
        .eq('userId', userId)
      if (!userStatPrev.data?.length) {
        await supabase.from('statistics').insert({ userId, ...userStat })
      } else {
        await supabase.from('statistics').update(userStat).eq('userId', userId)
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
