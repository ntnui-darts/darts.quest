<template>
  <br />
  <h2>Game Type</h2>
  <div class="row options">
    <button
      v-for="gameType in (['x01', 'rtc', 'killer'] satisfies GameType[])"
      :class="{ selected: selectedGameType == gameType }"
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
  <div
    v-for="stat in getStats(selectedGameType, subCategory)"
    class="col"
    :key="stat.text"
  >
    <h3>{{ stat.text }}</h3>
    <table>
      <tbody>
        <tr v-for="(userStat, userId, i) in stat.userStats">
          <td>{{ i + 1 }}. {{ useUsersStore().getUser(userId)?.name }}</td>
          <td style="text-align: end">
            {{
              stat.transform
                ? stat.transform(userStat ?? 0)
                : roundToTwoDecimals(userStat ?? 0)
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
import { ref } from 'vue'
import { useStatsStore, toPercentage, roundToTwoDecimals } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { GameTypeNames } from '@/games/games'
import type { GameType } from '@/games/games'

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

type Stat = {
  text: string
  userStats: Record<string, number | null>
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
              userStats: store.getCount(store.x01Stats),
            },
            {
              text: 'Average First 9 Avg',
              userStats: store.getAvg(store.x01Stats, 'first9Avg', false),
            },
            {
              text: 'Highest First 9 Average',
              userStats: store.getMax(store.x01Stats, 'first9Avg'),
            },
            {
              text: 'Highest Double Checkout',
              userStats: store.getMax(store.getX01(true, null, 2), 'checkout'),
            },
            {
              text: 'Highest Single Visit Score',
              userStats: store.getMax(store.x01Stats, 'maxVisitScore'),
            },
          ]
        case '301 Double':
          return [
            {
              text: 'Average # Darts',
              userStats: store.getAvg(store.getX01(true, 301, 2), 'darts'),
            },
            {
              text: 'Fastest # Darts',
              userStats: store.getMin(store.getX01(true, 301, 2), 'darts'),
            },
            {
              text: 'Slowest # Darts',
              userStats: store.getMax(store.getX01(true, 301, 2), 'darts'),
            },
          ]
        case '501 Double':
          return [
            {
              text: 'Average # Darts',
              userStats: store.getAvg(store.getX01(true, 501, 2), 'darts'),
            },
            {
              text: 'Fastest # Darts',
              userStats: store.getMin(store.getX01(true, 501, 2), 'darts'),
            },
            {
              text: 'Slowest # Darts',
              userStats: store.getMax(store.getX01(true, 501, 2), 'darts'),
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
              userStats: store.getCount(store.rtcStats),
            },
            {
              text: 'Fewest Darts',
              userStats: store.getMin(store.getRtc(true, 1), 'darts'),
            },
            {
              text: 'Longest Streak',
              userStats: store.getMax(store.rtcStats, 'maxStreak'),
            },
          ]
        case 'Single':
          return [
            {
              text: 'Average Hit Rate',
              userStats: store.getAvg(store.getRtc(false, 1), 'hitRate', false),
              transform: toPercentage,
            },
          ]
        case 'Double':
          return [
            {
              text: 'Average Hit Rate',
              userStats: store.getAvg(store.getRtc(false, 2), 'hitRate', false),
              transform: toPercentage,
            },
          ]
        case 'Triple':
          return [
            {
              text: 'Average Hit Rate',
              userStats: store.getAvg(store.getRtc(false, 3), 'hitRate', false),
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
          userStats: store.getCount(store.killerStats),
        },
      ]
    case 'skovhugger':
      return []
  }
}
</script>
