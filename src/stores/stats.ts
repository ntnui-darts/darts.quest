import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg, getTypeAttribute } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'
import { getFirst9Avg, getX01VisitScore } from '@/games/x01'
import { sumNumbers } from '@/games/rtc'

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
      let min501DoubleVisits = null as number | null
      let maxX01VisitScore = 0
      let maxX01First9Avg = 0
      let maxX01DoubleCheckout = 0
      let max501DoubleVisits = 0
      let avgRtcHitRateLast10 = 0
      let avg501DoubleVisitsLast10 = 0
      let avg301DoubleVisitsLast10 = 0
      let avgKillerResult = 0

      const legs = this.legs.filter((leg) => leg.finish)
      const rtcLegs = legs.filter((leg) => leg.type == 'rtc')
      const rtcGames = this.games.filter((leg) => leg.type == 'rtc')
      const rtcLegsLast10 = rtcLegs.slice(-10)
      if (rtcLegsLast10.length > 0) {
        avgRtcHitRateLast10 =
          sumNumbers(
            rtcLegsLast10.map((leg) => 20 / (leg.visits.flat().length || 1))
          ) / rtcLegsLast10.length
      }
      const x01DoubleLegs = legs.filter(
        (leg) =>
          leg.type == 'x01' && getTypeAttribute<number>(leg, 'finish', 1) == 2
      )
      const x01Games = this.games.filter((leg) => leg.type == 'x01')
      const _501DoubleLegsLast10 = x01DoubleLegs
        .filter((leg) => getTypeAttribute<number>(leg, 'startScore', 0) == 501)
        .slice(-10)
      if (_501DoubleLegsLast10.length > 0) {
        avg501DoubleVisitsLast10 =
          sumNumbers(_501DoubleLegsLast10.map((leg) => leg.visits.length)) /
          _501DoubleLegsLast10.length
      }
      const _301DoubleLegsLast10 = x01DoubleLegs
        .filter((leg) => getTypeAttribute<number>(leg, 'startScore', 0) == 301)
        .slice(-10)
      if (_301DoubleLegsLast10.length > 0) {
        avg301DoubleVisitsLast10 =
          sumNumbers(_301DoubleLegsLast10.map((leg) => leg.visits.length)) /
          _301DoubleLegsLast10.length
      }
      const killerGames = this.games.filter((leg) => leg.type == 'killer')
      if (killerGames.length > 0) {
        avgKillerResult =
          sumNumbers(
            killerGames.map((game) => {
              let index = game.result.indexOf(userId)
              if (index < 0) return 0
              return (
                (game.result.length - 1 - index) /
                (Math.max(game.players.length, 2) - 1)
              )
            })
          ) / killerGames.length
      }

      legs.forEach((leg) => {
        switch (leg.type) {
          case 'rtc':
            const fastMode = getTypeAttribute<boolean>(leg, 'fast', false)
            if (fastMode) return
            minRtcVisits = Math.min(minRtcVisits ?? Infinity, leg.visits.length)
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
            const startScore = getTypeAttribute<number>(leg, 'startScore', 0)
            const finishType = getTypeAttribute<number>(leg, 'finish', 1)
            if (startScore == 301 && finishType == 2) {
              min301DoubleVisits = Math.min(
                min301DoubleVisits ?? Infinity,
                leg.visits.length
              )
            }
            if (startScore == 501 && finishType == 2) {
              min501DoubleVisits = Math.min(
                min501DoubleVisits ?? Infinity,
                leg.visits.length
              )
              max501DoubleVisits = Math.max(
                max501DoubleVisits,
                leg.visits.length
              )
            }
            const lastVisit = leg.visits.at(-1)
            if (lastVisit && finishType == 2) {
              maxX01DoubleCheckout = Math.max(
                maxX01DoubleCheckout,
                getX01VisitScore(lastVisit)
              )
            }
            maxX01VisitScore = Math.max(
              maxX01VisitScore,
              ...leg.visits.map((v) => getX01VisitScore(v))
            )
            maxX01First9Avg = Math.max(
              maxX01First9Avg,
              getFirst9Avg(leg.visits, leg)
            )
            break
          case 'killer':
            break
        }
      })
      const userStat = {
        maxRtcStreak,
        minRtcVisits,
        min301DoubleVisits,
        min501DoubleVisits,
        maxX01VisitScore,
        maxX01First9Avg,
        maxX01DoubleCheckout,
        max501DoubleVisits,
        avgRtcHitRateLast10,
        avg301DoubleVisitsLast10,
        avg501DoubleVisitsLast10,
        avgKillerResult,
        numRtcGames: rtcGames.length,
        numX01Games: x01Games.length,
        numKillerGames: killerGames.length,
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
