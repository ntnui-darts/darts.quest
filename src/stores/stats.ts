import { compareCreatedAt } from '@/functions/compare'
import { CricketGameState } from '@/games/cricket'
import type { GameType } from '@/games/games'
import { getMaxStreak, getRtcHitRate } from '@/games/rtc'
import { getSkovhuggerScore } from '@/games/skovhugger'
import { getFirst9Avg, getX01VisitScore } from '@/games/x01'
import { supabase } from '@/supabase'
import { DbGame, Game, GameState, Leg, getTypeAttribute } from '@/types/game'
import { Database } from '@/types/supabase'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useEloStore } from './elo'
import { useUsersStore } from './users'

type LegJoin = {
  legs: {
    id: string
    createdAt: string
    typeAttributes: string[]
    userId: string
    finish: boolean
    beers: number | null
    type: GameType
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
export type CricketStat =
  Database['public']['Tables']['statistics_cricket']['Row'] & LegJoin
export type AnyStat =
  | KillerStat
  | RtcStat
  | SkovhuggerStat
  | X01Stat
  | CricketStat

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
    cricketStats: [] as CricketStat[],
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      await useEloStore().fetchPersonalElo()
      await this.fetchLegs()
      await this.fetchGames()
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
      const games = await supabase.from('games').select('*').contains('players',[id])
      if (games.data){
        this.games = (games.data as DbGame[]).toSorted(compareCreatedAt)
      }
    },

    async fetchStats() {
      const users = useUsersStore().users
      const x01Stats = await supabase
        .from('statistics_x01')
        .select(
          '*, legs (id, type, createdAt, typeAttributes, userId, finish, beers)'
        )

      if (x01Stats.data) {
        this.x01Stats = (
          x01Stats.data.filter(
            (s) => s.legs != null && users.find((u) => u.id == s.legs?.userId)
          ) as X01Stat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const rtcStats = await supabase
        .from('statistics_rtc')
        .select(
          '*, legs (id, type, createdAt, typeAttributes, userId, finish, beers)'
        )
      if (rtcStats.data) {
        this.rtcStats = (
          rtcStats.data.filter(
            (s) => s.legs != null && users.find((u) => u.id == s.legs?.userId)
          ) as RtcStat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const killerStats = await supabase
        .from('statistics_killer')
        .select(
          '*, legs (id, type, createdAt, typeAttributes, userId, finish, beers)'
        )
      if (killerStats.data) {
        this.killerStats = (
          killerStats.data.filter(
            (s) => s.legs != null && users.find((u) => u.id == s.legs?.userId)
          ) as KillerStat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const skovhuggerStats = await supabase
        .from('statistics_skovhugger')
        .select(
          '*, legs (id, type, createdAt, typeAttributes, userId, finish, beers)'
        )
      if (skovhuggerStats.data) {
        this.skovhuggerStats = (
          skovhuggerStats.data.filter(
            (s) => s.legs != null && users.find((u) => u.id == s.legs?.userId)
          ) as SkovhuggerStat[]
        ).toSorted(compareLegsCreatedAt)
      }
      const cricketStats = await supabase
        .from('statistics_cricket')
        .select(
          '*, legs (id, type, createdAt, typeAttributes, userId, finish, beers)'
        )
      if (cricketStats.data) {
        this.cricketStats = (
          cricketStats.data.filter(
            (s) => s.legs != null && users.find((u) => u.id == s.legs?.userId)
          ) as CricketStat[]
        ).toSorted(compareLegsCreatedAt)
      }
    },

    getStats(gameType: GameType): AnyStat[] {
      switch (gameType) {
        case 'killer':
          return this.killerStats
        case 'rtc':
          return this.rtcStats
        case 'skovhugger':
          return this.skovhuggerStats
        case 'x01':
          return this.x01Stats
        case 'cricket':
          return this.cricketStats
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

    getSum<T extends AnyStat>(stats: T[], key: keyof Omit<T, 'id' | 'legs'>) {
      return this.getCompressed(stats, key, 0, false, (old, next) => old + next)
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
          options.startScore !== undefined &&
          getTypeAttribute<number>(stat.legs, 'startScore', 0) !=
            options.startScore
        )
          return false

        if (
          options.finish !== undefined &&
          getTypeAttribute<number>(stat.legs, 'finish', 0) != options.finish
        )
          return false

        return true
      })
    },

    getRtc(options: {
      since?: Date
      allowUnfinished?: boolean
      mode?: 1 | 2 | 3
      fast?: boolean
      forced?: boolean
    }) {
      return this.rtcStats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        if (
          options.mode !== undefined &&
          getTypeAttribute<number>(stat.legs, 'mode', 0) != options.mode
        )
          return false

        if (
          options.fast !== undefined &&
          getTypeAttribute<boolean>(stat.legs, 'fast', false) != options.fast
        )
          return false

        if (
          options.forced !== undefined &&
          getTypeAttribute<boolean>(stat.legs, 'forced', false) !=
            options.forced
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

    getCricket(options: { since?: Date; allowUnfinished?: boolean }) {
      return this.cricketStats.filter((stat) => {
        if (
          options.since &&
          new Date(stat.legs.createdAt).getTime() < options.since.getTime()
        )
          return false

        if (!options.allowUnfinished && !stat.legs.finish) return false

        return true
      })
    },

    getAll(options: { allowUnfinished?: boolean }) {
      return [
        ...this.getX01(options),
        ...this.getCricket(options),
        ...this.getKiller(options),
        ...this.getSkovhugger(options),
        ...this.getRtc(options),
      ]
    },
  },

  getters: {},
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
      label: useUsersStore().getName(user),
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
    label: useUsersStore().getName(user),
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
      label: useUsersStore().getName(user),
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
  gameState: GameState,
  eloDelta: number
): Promise<boolean> => {
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
      return true

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
      return true

    case 'killer':
      await supabase.from('statistics_killer').upsert({
        id: leg.id,
        darts,
        winRate,
        eloDelta,
      })
      return true

    case 'skovhugger':
      await supabase.from('statistics_skovhugger').upsert({
        id: leg.id,
        score: getSkovhuggerScore(leg.visits),
        winRate,
        eloDelta,
      })
      return true

    case 'cricket':
      await supabase.from('statistics_cricket').upsert({
        id: leg.id,
        score:
          (gameState as CricketGameState).players.find(
            (player) => player.id == leg.userId
          )?.score ?? 0,
        winRate,
        eloDelta,
      })
      return true
  }
}
