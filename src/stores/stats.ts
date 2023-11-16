import { acceptHMRUpdate, defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { DbGame, Game, Leg, getTypeAttribute } from '@/types/game'
import { useAuthStore } from './auth'
import { Database } from '@/types/supabase'
import { getFirst9Avg, getX01VisitScore } from '@/games/x01'
import { getMaxStreak, getRtcHitRate } from '@/games/rtc'
import { getSkovhuggerScore } from '@/games/skovhugger'
import { compareCreatedAt } from '@/functions/compare'
import type { GameType } from '@/games/games'
import { useUsersStore } from './users'

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
export type AnyStat = KillerStat | RtcStat | SkovhuggerStat | X01Stat

const compareLegsCreatedAt = (
  a: { legs: { createdAt: string } },
  b: { legs: { createdAt: string } }
) => new Date(a.legs.createdAt).getTime() - new Date(b.legs.createdAt).getTime()

export const useStatsStore = defineStore('stats', {
  state: () => ({
    loading: true,
    legs: [] as Leg[],
    games: [] as DbGame[],
    x01Stats: [] as X01Stat[],
    rtcStats: [] as RtcStat[],
    killerStats: [] as KillerStat[],
    skovhuggerStats: [] as SkovhuggerStat[],
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      await this.fetchGames()
      await this.fetchLegs()
      await this.fetchStats()
      this.loading = false
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
        ? stats.filter((userStat) => userStat[key] != null)
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

    getX01(options: {
      since?: Date
      allowUnfinished?: boolean
      startScore?: 301 | 501 | 701
      finish?: 1 | 2 | 3
    }) {
      return this.x01Stats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        if (
          options.startScore != undefined &&
          getTypeAttribute<number>(stat.legs, 'startScore', 0) !=
            options.startScore
        )
          return false
        if (
          options.finish != undefined &&
          getTypeAttribute<number>(stat.legs, 'finish', 0) != options.finish
        )
          return
        false

        return true
      })
    },

    getRtc(options: {
      since?: Date
      allowUnfinished?: boolean
      mode?: 1 | 2 | 3
    }) {
      return this.rtcStats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        if (
          options.mode != undefined &&
          getTypeAttribute<number>(stat.legs, 'mode', 0) != options.mode
        )
          return false

        return true
      })
    },

    getKiller(options: { since?: Date; allowUnfinished?: boolean }) {
      return this.killerStats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        return true
      })
    },

    getSkovhugger(options: { since?: Date; allowUnfinished?: boolean }) {
      return this.skovhuggerStats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        return true
      })
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

export const getAccumulatedDataset = <T extends AnyStat>(
  users: string[],
  stats: T[],
  getY: (s: T) => number | null,
  initialValue: number,
  options: object
) => {
  return users.map((user) => {
    let sum = initialValue
    return {
      ...options,
      label: useUsersStore().getUser(user)?.name ?? 'Unknown',
      data: stats
        .filter((s) => s.legs.userId == user && getY(s) != null)
        .map((stat) => {
          sum += getY(stat) ?? 0
          return {
            x: new Date(stat.legs.createdAt),
            y: sum,
          }
        }),
    }
  })
}

export const getDataset = <T extends AnyStat>(
  users: string[],
  stats: T[],
  getY: (s: T) => number | null,
  options: object
) => {
  return users.map((user) => ({
    ...options,
    label: useUsersStore().getUser(user)?.name ?? 'Unknown',
    data: stats
      .filter((s) => s.legs.userId == user && getY(s) != null)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: getY(stat),
      })),
  }))
}

export const getNumberOfGamesDataset = <T extends AnyStat>(
  users: string[],
  stats: T[],
  options: object
) => {
  return users.map((user) => {
    let y = 1
    return {
      ...options,
      label: useUsersStore().getUser(user)?.name ?? 'Unknown',
      data: stats
        .filter((s) => s.legs.userId == user)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
}

export const toPercentage = (n: number) => {
  return Math.round(n * 1000) / 10 + ' %'
}

export const roundToNDecimals = (value: number, n: number) => {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
}

const getWinRate = (game: Pick<Game, 'result' | 'players'>, userId: string) => {
  if (game.players.length < 2) return null
  let index = game.result.indexOf(userId)
  if (index < 0) return 0
  return (game.players.length - index - 1) / (game.players.length - 1)
}

export const upsertLegStatistics = async (
  leg: Leg,
  game: Pick<Game, 'result' | 'players'>,
  eloDelta: number
) => {
  const segments = leg.visits.flat().filter((s) => s != null)
  const darts = segments.length
  const winRate = getWinRate(game, leg.userId)

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
        winRate,
        eloDelta,
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
        winRate,
        eloDelta,
      })
      break

    case 'killer':
      await supabase.from('statistics_killer').upsert({
        id: leg.id,
        darts,
        winRate,
        eloDelta,
      })
      break

    case 'skovhugger':
      await supabase.from('statistics_skovhugger').upsert({
        id: leg.id,
        score: getSkovhuggerScore(leg.visits),
        winRate,
        eloDelta,
      })
      break
  }
}
