import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg, getTypeAttribute } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'
import { getFirst9Avg, getX01VisitScore } from '@/games/x01'
import { getMaxStreak, getRtcHitRate, sumNumbers } from '@/games/rtc'

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
      let avgX01First9AvgLast10 = 0
      let maxX01DoubleCheckout = 0
      let max501DoubleVisits = 0
      let avgRtcSingleHitRateLast10 = 0
      let avgRtcDoubleHitRateLast10 = 0
      let avgRtcTripleHitRateLast10 = 0
      let avg501DoubleVisitsLast10 = 0
      let avg301DoubleVisitsLast10 = 0
      let avgKillerWinRateLast10 = 0

      const finishedLegs = this.legs.filter((leg) => leg.finish)
      const rtcLegs = finishedLegs.filter((leg) => leg.type == 'rtc')
      const rtcGames = this.games.filter((leg) => leg.type == 'rtc')
      const rtcSingleLegs = rtcLegs.filter(
        (leg) => getTypeAttribute<number>(leg, 'mode', 1) == 1
      )
      const rtcDoubleLegs = rtcLegs.filter(
        (leg) => getTypeAttribute<number>(leg, 'mode', 1) == 2
      )
      const rtcTripleLegs = rtcLegs.filter(
        (leg) => getTypeAttribute<number>(leg, 'mode', 1) == 3
      )
      const rtcSingleLegsLast10 = rtcSingleLegs.slice(-10)
      if (rtcSingleLegsLast10.length > 0) {
        avgRtcSingleHitRateLast10 =
          sumNumbers(
            rtcSingleLegsLast10.map((leg) => getRtcHitRate(leg.visits))
          ) / rtcSingleLegsLast10.length
      }
      const rtcDoubleLegsLast10 = rtcDoubleLegs.slice(-10)
      if (rtcDoubleLegsLast10.length > 0) {
        avgRtcDoubleHitRateLast10 =
          sumNumbers(
            rtcDoubleLegsLast10.map((leg) => getRtcHitRate(leg.visits))
          ) / rtcDoubleLegsLast10.length
      }
      const rtcTripleLegsLast10 = rtcTripleLegs.slice(-10)
      if (rtcTripleLegsLast10.length > 0) {
        avgRtcTripleHitRateLast10 =
          sumNumbers(
            rtcTripleLegsLast10.map((leg) => getRtcHitRate(leg.visits))
          ) / rtcTripleLegsLast10.length
      }
      const x01Legs = finishedLegs.filter((leg) => leg.type == 'x01')
      const x01DoubleLegs = x01Legs.filter(
        (leg) => getTypeAttribute<number>(leg, 'finish', 1) == 2
      )
      const x01LegsLast10 = x01Legs.slice(-10)
      if (x01LegsLast10.length > 0) {
        avgX01First9AvgLast10 =
          sumNumbers(
            x01LegsLast10.map((leg) => getFirst9Avg(leg.visits, leg))
          ) / x01LegsLast10.length
      }
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
      const killerGamesLast10 = killerGames.slice(-10)
      if (killerGamesLast10.length > 0) {
        avgKillerWinRateLast10 =
          sumNumbers(
            killerGamesLast10.map((game) => {
              let index = game.result.indexOf(userId)
              if (index < 0 || game.players.length < 2) return 0
              return (
                (2 * game.players.length - game.result.length - index - 1) /
                (game.players.length - 1)
              )
            })
          ) / killerGamesLast10.length
      }

      finishedLegs.forEach((leg) => {
        switch (leg.type) {
          case 'rtc':
            const fastMode = getTypeAttribute<boolean>(leg, 'fast', false)
            if (fastMode) return
            minRtcVisits = Math.min(minRtcVisits ?? Infinity, leg.visits.length)
            maxRtcStreak = Math.max(maxRtcStreak, getMaxStreak(leg.visits))
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
        userId,
        maxRtcStreak,
        minRtcVisits,
        min301DoubleVisits,
        min501DoubleVisits,
        maxX01VisitScore,
        maxX01First9Avg,
        avgX01First9AvgLast10,
        maxX01DoubleCheckout,
        max501DoubleVisits,
        avgRtcSingleHitRateLast10,
        avgRtcDoubleHitRateLast10,
        avgRtcTripleHitRateLast10,
        avg301DoubleVisitsLast10,
        avg501DoubleVisitsLast10,
        avgKillerWinRateLast10,
        numRtcGames: rtcGames.length,
        numX01Games: x01Games.length,
        numKillerGames: killerGames.length,
      } satisfies Database['public']['Tables']['statistics']['Row']
      const userStatPrev = await supabase
        .from('statistics')
        .select('*')
        .eq('userId', userId)
      if (!userStatPrev.data?.length) {
        await supabase.from('statistics').insert(userStat)
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

export const toPercentage = (n: number) => {
  return Math.round(n * 1000) / 10 + ' %'
}

export const roundToTwoDecimals = (n: number) => {
  return Math.round(n * 100) / 100
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}

export const insertLegStatistics = async (leg: Leg) => {
  const segments = leg.visits.flat().filter((s) => s != null)
  const darts = segments.length

  switch (leg.type) {
    case 'x01':
      const maxVisitScore = Math.max(
        0,
        ...leg.visits.map((v) => getX01VisitScore(v))
      )
      const first9Avg = getFirst9Avg(leg.visits, leg)
      const lastVisit = leg.visits.at(-1)
      const checkout = lastVisit ? getX01VisitScore(lastVisit) : 0
      await supabase.from('statistics_x01').insert({
        legId: leg.id,
        darts,
        maxVisitScore,
        first9Avg,
        checkout,
      })
      break

    case 'rtc':
      const maxStreak = getMaxStreak(leg.visits)
      const hitRate = getRtcHitRate(leg.visits)
      await supabase.from('statistics_rtc').insert({
        legId: leg.id,
        darts,
        maxStreak,
        hitRate,
      })
      break

    case 'killer':
      await supabase.from('statistics_killer').insert({
        legId: leg.id,
        darts,
      })
      break
  }
}
