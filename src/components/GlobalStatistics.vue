<template>
  <br />
  <h2>Game Type</h2>
  <div class="row options" style="overflow: auto">
    <button
      v-for="gameType in (['x01', 'rtc', 'killer', 'skovhugger', 'cricket'] satisfies GameType[])"
      :class="{ selected: selectedGameType == gameType }"
      style="min-width: 120px"
      @click="selectGameType(gameType)"
    >
      {{ GameTypeNames[gameType] }}
    </button>
  </div>
  <div v-if="selectedGameType == 'x01'" class="row options">
    <button
      v-for="option in (['General', '301 Double', '501 Double'] as const)"
      :class="{ selected: subCategory == option }"
      @click="subCategory = option"
    >
      {{ option }}
    </button>
  </div>
  <div v-if="selectedGameType == 'rtc'" class="row options">
    <button
      v-for="option in (['General', 'Single', 'Double', 'Triple'] as const)"
      :class="{ selected: subCategory == option }"
      @click="subCategory = option"
    >
      {{ option }}
    </button>
  </div>
  <div v-for="stat in currentStats" class="col" :key="stat.text">
    <h3>{{ stat.text }}</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Last 14 Days</th>
          <th>All Time</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(userId, i) in new Set([
            ...Object.keys(stat.last14Days),
            ...Object.keys(stat.allTime),
          ])"
        >
          <td
            :class="{
              highlighted:
                userId == useAuthStore().auth?.id ? 'bold' : undefined,
            }"
          >
            {{ i + 1 }}.
            {{ stringMaxLength(useUsersStore().getUser(userId)?.name, 18) }}
          </td>
          <td style="text-align: end">
            {{
              stat.last14Days[userId] != null
                ? stat.transform
                  ? stat.transform(stat.last14Days[userId]!)
                  : roundToNDecimals(stat.last14Days[userId]!, 2)
                : null
            }}
          </td>
          <td style="text-align: end">
            {{
              stat.allTime[userId] != null
                ? stat.transform
                  ? stat.transform(stat.allTime[userId]!)
                  : roundToNDecimals(stat.allTime[userId]!, 2)
                : null
            }}
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <hr />
    </div>
  </div>
  <br />
  <br />
  <br />
</template>

<script lang="ts" setup>
import { stringMaxLength } from '@/functions/string'
import type { GameType } from '@/games/games'
import { GameTypeNames } from '@/games/games'
import { useAuthStore } from '@/stores/auth'
import { roundToNDecimals, toPercentage, useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { addDays } from 'date-fns'
import { computed, ref } from 'vue'

const store = useStatsStore()

type SubCategory =
  | 'General'
  | '301 Double'
  | '501 Double'
  | 'Single'
  | 'Double'
  | 'Triple'
const selectedGameType = ref<GameType>('x01')
const subCategory = ref<SubCategory>('General')

const selectGameType = (type: GameType) => {
  selectedGameType.value = type
  subCategory.value = 'General'
}

const currentStats = computed(() => {
  const stats = getStats(selectedGameType.value, subCategory.value)
  return stats.map((stat) => {
    const allTime = stat.userStats(new Date(0))
    const last14Days = stat.userStats(addDays(new Date(), -14))
    return {
      ...stat,
      allTime,
      last14Days,
    }
  })
})

type Stat = {
  text: string
  userStats: (since: Date) => Record<string, number | null>
  transform?: (n: number) => string
}

const getStats = (gameType: GameType, subCategory: SubCategory): Stat[] => {
  switch (gameType) {
    case 'x01':
      switch (subCategory) {
        case 'General':
          return [
            {
              text: 'Number of Games',
              userStats: (d) =>
                store.getCount(
                  store.getX01({ since: d, allowUnfinished: true })
                ),
            },
            {
              text: 'Elo Delta',
              userStats: (d) =>
                store.getSum(
                  store.getX01({ since: d, allowUnfinished: true }),
                  'eloDelta'
                ),
            },
            {
              text: 'Average First 9 Avg',
              userStats: (d) =>
                store.getAvg(
                  store.getX01({ since: d, allowUnfinished: true }),
                  'first9Avg',
                  false
                ),
            },
            {
              text: 'Highest First 9 Average',
              userStats: (d) =>
                store.getMax(
                  store.getX01({ since: d, allowUnfinished: true }),
                  'first9Avg'
                ),
            },
            {
              text: 'Highest Double Checkout',
              userStats: (d) =>
                store.getMax(store.getX01({ since: d, finish: 2 }), 'checkout'),
            },
            {
              text: 'Highest Single Visit Score',
              userStats: (d) =>
                store.getMax(
                  store.getX01({ since: d, allowUnfinished: true }),
                  'maxVisitScore'
                ),
            },
          ]
        case '301 Double':
          return [
            {
              text: 'Average # Darts',
              userStats: (d) =>
                store.getAvg(
                  store.getX01({ since: d, startScore: 301, finish: 2 }),
                  'darts'
                ),
            },
            {
              text: 'Fastest # Darts',
              userStats: (d) =>
                store.getMin(
                  store.getX01({ since: d, startScore: 301, finish: 2 }),
                  'darts'
                ),
            },
            {
              text: 'Slowest # Darts',
              userStats: (d) =>
                store.getMax(
                  store.getX01({ since: d, startScore: 301, finish: 2 }),
                  'darts'
                ),
            },
          ]
        case '501 Double':
          return [
            {
              text: 'Average # Darts',
              userStats: (d) =>
                store.getAvg(
                  store.getX01({ since: d, startScore: 501, finish: 2 }),
                  'darts'
                ),
            },
            {
              text: 'Fastest # Darts',
              userStats: (d) =>
                store.getMin(
                  store.getX01({ since: d, startScore: 501, finish: 2 }),
                  'darts'
                ),
            },
            {
              text: 'Slowest # Darts',
              userStats: (d) =>
                store.getMax(
                  store.getX01({ since: d, startScore: 501, finish: 2 }),
                  'darts'
                ),
            },
          ]
        default:
          return []
      }
    case 'rtc':
      switch (subCategory) {
        case 'General':
          return [
            {
              text: 'Number of Games',
              userStats: (d) =>
                store.getCount(
                  store.getRtc({ since: d, allowUnfinished: true })
                ),
            },
            {
              text: 'Elo Delta',
              userStats: (d) =>
                store.getSum(
                  store.getRtc({ since: d, allowUnfinished: true }),
                  'eloDelta'
                ),
            },
            {
              text: 'Fewest Darts',
              userStats: (d) =>
                store.getMin(
                  store.getRtc({ since: d, fast: false, forced: false }),
                  'darts'
                ),
            },
            {
              text: 'Longest Streak',
              userStats: (d) =>
                store.getMax(
                  store.getRtc({ since: d, allowUnfinished: true }),
                  'maxStreak'
                ),
            },
          ]
        case 'Single':
          return [
            {
              text: 'Average Hit Rate',
              userStats: (d) =>
                store.getAvg(
                  store.getRtc({ since: d, mode: 1 }),
                  'hitRate',
                  false
                ),
              transform: toPercentage,
            },
          ]
        case 'Double':
          return [
            {
              text: 'Average Hit Rate',
              userStats: (d) =>
                store.getAvg(
                  store.getRtc({ since: d, mode: 2 }),
                  'hitRate',
                  false
                ),
              transform: toPercentage,
            },
          ]
        case 'Triple':
          return [
            {
              text: 'Average Hit Rate',
              userStats: (d) =>
                store.getAvg(
                  store.getRtc({ since: d, mode: 3 }),
                  'hitRate',
                  false
                ),
              transform: toPercentage,
            },
          ]
        default:
          return []
      }
    case 'killer':
      return [
        {
          text: 'Number of Games',
          userStats: (d) => store.getCount(store.getKiller({ since: d })),
        },
        {
          text: 'Elo Delta',
          userStats: (d) =>
            store.getSum(
              store.getKiller({ since: d, allowUnfinished: true }),
              'eloDelta'
            ),
        },
      ]
    case 'skovhugger':
      return [
        {
          text: 'Number of Games',
          userStats: (d) => store.getCount(store.getSkovhugger({ since: d })),
        },
        {
          text: 'Elo Delta',
          userStats: (d) =>
            store.getSum(
              store.getSkovhugger({ since: d, allowUnfinished: true }),
              'eloDelta'
            ),
        },
        {
          text: 'Average Score',
          userStats: (d) =>
            store.getAvg(store.getSkovhugger({ since: d }), 'score', false),
          transform: (n) => roundToNDecimals(n, 0).toString(),
        },
        {
          text: 'Highest Score',
          userStats: (d) =>
            store.getMax(store.getSkovhugger({ since: d }), 'score'),
        },
        {
          text: 'Lowest Score',
          userStats: (d) =>
            store.getMin(store.getSkovhugger({ since: d }), 'score'),
        },
      ]
    case 'cricket':
      return [
        {
          text: 'Number of Games',
          userStats: (d) => store.getCount(store.getCricket({ since: d })),
        },
        {
          text: 'Elo Delta',
          userStats: (d) =>
            store.getSum(
              store.getCricket({ since: d, allowUnfinished: true }),
              'eloDelta'
            ),
        },
        {
          text: 'Average Score',
          userStats: (d) =>
            store.getAvg(store.getCricket({ since: d }), 'score', false),
          transform: (n) => roundToNDecimals(n, 0).toString(),
        },
        {
          text: 'Highest Score',
          userStats: (d) =>
            store.getMax(store.getCricket({ since: d }), 'score'),
        },
        {
          text: 'Lowest Score',
          userStats: (d) =>
            store.getMin(store.getCricket({ since: d }), 'score'),
        },
      ]
  }
}
</script>

<style scoped>
.highlighted {
  font-weight: bold;
}
</style>
