import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Leg, getTypeAttribute } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'
import { getFirst9Avg, getX01VisitScore } from '@/games/x01'
import { getMaxStreak, getRtcHitRate } from '@/games/rtc'
import { getSkovhuggerScore } from '@/games/skovhugger'
import { compareCreatedAt } from '@/functions/compare'
import type { GameType } from '@/games/games'

type LegJoin = {
  legs: {
    id: string
    createdAt: string
    typeAttributes: string[]
    userId: string
    finish: boolean
  }
}
export type X01Stat = Database['public']['Tables']['statistics_x01']['Row'] &
  LegJoin
export type RtcStat = Database['public']['Tables']['statistics_rtc']['Row'] &
  LegJoin
export type KillerStat =
  Database['public']['Tables']['statistics_killer']['Row'] & LegJoin
export type SkovhuggerStat =
  Database['public']['Tables']['statistics_skovhugger']['Row'] & LegJoin
type AnyStat = KillerStat | RtcStat | SkovhuggerStat | X01Stat

const compareLegsCreatedAt = (
  a: { legs: { createdAt: string } },
  b: { legs: { createdAt: string } }
) => new Date(a.legs.createdAt).getTime() - new Date(b.legs.createdAt).getTime()

export const useStatsStore = defineStore('stats', {
  state: () => ({
    legs: [] as Leg[],
    games: [] as DbGame[],
    x01Stats: [] as X01Stat[],
    rtcStats: [] as RtcStat[],
    killerStats: [] as KillerStat[],
    skovhuggerStats: [] as SkovhuggerStat[],
  }),

  actions: {
    async fetchAll() {
      await this.fetchGames()
      await this.fetchLegs()
      await this.fetchStats()
    },

    async fetchLegs() {
      const id = useAuthStore().auth?.id
      if (!id) return
      const legs = await supabase.from('legs').select('*').eq('userId', id)
      if (legs.data) {
        this.legs = (legs.data as Leg[]).toSorted(compareCreatedAt)
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
        this.games = games.data.toSorted(compareCreatedAt)
      }
    },

    async fetchStats() {
      const x01Stats = await supabase
        .from('statistics_x01')
        .select('*, legs (id, createdAt, typeAttributes, userId, finish)')
      if (x01Stats.data) {
        this.x01Stats = (
          x01Stats.data.filter((s) => s.legs != null) as X01Stat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const rtcStats = await supabase
        .from('statistics_rtc')
        .select('*, legs (id, createdAt, typeAttributes, userId, finish)')
      if (rtcStats.data) {
        this.rtcStats = (
          rtcStats.data.filter((s) => s.legs != null) as RtcStat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const killerStats = await supabase
        .from('statistics_killer')
        .select('*, legs (id, createdAt, typeAttributes, userId, finish)')
      if (killerStats.data) {
        this.killerStats = (
          killerStats.data.filter((s) => s.legs != null) as KillerStat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const skovhuggerStats = await supabase
        .from('statistics_skovhugger')
        .select('*, legs (id, createdAt, typeAttributes, userId, finish)')
      if (skovhuggerStats.data) {
        this.skovhuggerStats = (
          skovhuggerStats.data.filter((s) => s.legs != null) as SkovhuggerStat[]
        ).toSorted(compareLegsCreatedAt)
      }
    },

    getStats(gameType: GameType) {
      switch (gameType) {
        case 'killer':
          return this.killerStats
        case 'rtc':
          return this.rtcStats
        case 'skovhugger':
          return this.skovhuggerStats
        case 'x01':
          return this.x01Stats
      }
    },

    getCompressed<T extends AnyStat>(
      stats: T[],
      key: keyof Omit<T, 'id' | 'legs'> | null,
      _default: number,
      ascending: boolean,
      compress: (old: number, next: number, userId: string) => number
    ) {
      const filtered = key
        ? stats.filter(
            (userStat) => userStat[key] != null && userStat[key] != 0
          )
        : stats

      const result: Record<string, number> = {}
      filtered.forEach((stat) => {
        const userId = stat.legs.userId
        const attr = key ? stat[key] : 0
        if (attr == null || !userId) return
        if (typeof attr != 'number') return
        if (!(userId in result)) {
          result[userId] = _default
        }
        result[userId] = compress(result[userId], attr, userId)
      })

      const sorted = Object.entries(result)
        .sort(([, a], [, b]) => (ascending ? a - b : b - a))
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {})

      return sorted
    },

    getMax<T extends AnyStat>(stats: T[], key: keyof Omit<T, 'id' | 'legs'>) {
      return this.getCompressed(stats, key, 0, false, (old, next) =>
        Math.max(old, next)
      )
    },

    getMin<T extends AnyStat>(stats: T[], key: keyof Omit<T, 'id' | 'legs'>) {
      return this.getCompressed(stats, key, Infinity, true, (old, next) =>
        Math.min(old, next)
      )
    },

    getCount(stats: AnyStat[]) {
      return this.getCompressed(stats, null, 0, false, (old) => old + 1)
    },

    getAvg<T extends AnyStat>(
      stats: T[],
      key: keyof Omit<T, 'id' | 'legs'>,
      ascending = true
    ) {
      let nMap = new Map<string, number>()
      let sumMap = new Map<string, number>()
      const compress = (_: number, next: number, userId: string) => {
        const n = (nMap.get(userId) ?? 0) + 1
        const sum = (sumMap.get(userId) ?? 0) + next
        nMap.set(userId, n)
        sumMap.set(userId, sum)
        return sum / n
      }
      if (ascending) {
        return this.getCompressed(stats, key, Infinity, true, compress)
      } else {
        return this.getCompressed(stats, key, 0, false, compress)
      }
    },

    getX01(
      requireFinish: boolean,
      startScore: 301 | 501 | 701 | null,
      finish: 1 | 2 | 3 | null
    ) {
      return this.x01Stats.filter(
        (stat) =>
          (startScore == null ||
            getTypeAttribute<number>(stat.legs, 'startScore', 0) ==
              startScore) &&
          (finish == null ||
            getTypeAttribute<number>(stat.legs, 'finish', 0) == finish) &&
          (!requireFinish || stat.legs.finish)
      )
    },

    getRtc(requireFinish: boolean, mode: 1 | 2 | 3 | null) {
      return this.rtcStats.filter(
        (stat) =>
          (mode == null ||
            getTypeAttribute<number>(stat.legs, 'mode', 0) == mode) &&
          (!requireFinish || stat.legs.finish)
      )
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

export const upsertLegStatistics = async (leg: Leg) => {
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
      const checkout = leg.finish && lastVisit ? getX01VisitScore(lastVisit) : 0

      await supabase.from('statistics_x01').upsert({
        id: leg.id,
        darts,
        maxVisitScore,
        first9Avg,
        checkout,
      })
      break

    case 'rtc':
      const maxStreak = getMaxStreak(leg.visits)
      const hitRate = getRtcHitRate(leg.visits)
      await supabase.from('statistics_rtc').upsert({
        id: leg.id,
        darts,
        maxStreak,
        hitRate,
      })
      break

    case 'killer':
      await supabase.from('statistics_killer').upsert({
        id: leg.id,
        darts,
      })
      break

    case 'skovhugger':
      await supabase.from('statistics_skovhugger').upsert({
        id: leg.id,
        score: getSkovhuggerScore(leg.visits),
      })
      break
  }
}
