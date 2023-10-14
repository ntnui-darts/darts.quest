<template>
  <br />
  <h2>Game Type</h2>
  <div class="row options">
    <button
      v-for="(name, type) in GameTypeNames"
      :class="{ selected: gameType == type }"
      @click="gameType = type"
    >
      {{ name }}
    </button>
  </div>
  <div v-if="gameType == 'x01'" class="row options">
    <button
      v-for="option in (['General', '301 Double', '501 Double'] as const)"
      :class="{ selected: subCategory == option }"
      @click="subCategory = option"
    >
      {{ option }}
    </button>
  </div>
  <div
    v-for="stat in getStats(gameType, subCategory)"
    class="col"
    :key="stat.key"
  >
    <h3>{{ stat.text }}</h3>
    <table>
      <tbody>
        <tr v-for="(userStat, i) in stat.userStats">
          <td>
            {{ i + 1 }}. {{ useUsersStore().getUser(userStat.userId)?.name }}
          </td>
          <td style="text-align: end">
            {{
              stat.transform
                ? stat.transform(userStat[stat.key] ?? 0)
                : Math.round((userStat[stat.key] ?? 0) * 100) / 100
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
import { useStatsStore, UserStat } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { GameType, GameTypeNames } from '@/games/games'

const statsStore = useStatsStore()

type SubCategory = 'General' | '301 Double' | '501 Double'
const gameType = ref<GameType>('x01')
const subCategory = ref<SubCategory>('General')

const getStats = (
  gameType: GameType,
  subCategory: SubCategory
): {
  key: keyof Omit<UserStat, 'userId'>
  text: string
  userStats: UserStat[]
  transform?: (n: number) => string
}[] => {
  switch (gameType) {
    case 'x01':
      switch (subCategory) {
        case 'General':
          return [
            {
              key: 'numX01Games',
              text: 'Number of Games',
              userStats: sort(statsStore.userStats, 'numX01Games', 0, false),
            },
            {
              key: 'maxX01First9Avg',
              text: 'Highest First 9 Average',
              userStats: sort(
                statsStore.userStats,
                'maxX01First9Avg',
                0,
                false
              ),
            },
            {
              key: 'maxX01DoubleCheckout',
              text: 'Highest Double Checkout',
              userStats: sort(
                statsStore.userStats,
                'maxX01DoubleCheckout',
                0,
                false
              ),
            },
            {
              key: 'maxX01VisitScore',
              text: 'Highest Single Visit Score',
              userStats: sort(
                statsStore.userStats,
                'maxX01VisitScore',
                0,
                false
              ),
            },
          ]
        case '301 Double':
          return [
            {
              key: 'avg301DoubleVisitsLast10',
              text: 'Average # Visits Last 10 Games',
              userStats: sort(
                statsStore.userStats,
                'avg301DoubleVisitsLast10',
                Infinity
              ),
            },
            {
              key: 'min301DoubleVisits',
              text: 'Fastest [# Visits]',
              userStats: sort(
                statsStore.userStats,
                'min301DoubleVisits',
                Infinity
              ),
            },
          ]
        case '501 Double':
          return [
            {
              key: 'avg501DoubleVisitsLast10',
              text: 'Average # Visits Last 10 Games',
              userStats: sort(
                statsStore.userStats,
                'avg501DoubleVisitsLast10',
                Infinity
              ),
            },
            {
              key: 'min501DoubleVisits',
              text: 'Fastest [# Visits]',
              userStats: sort(
                statsStore.userStats,
                'min501DoubleVisits',
                Infinity
              ),
            },
            {
              key: 'max501DoubleVisits',
              text: 'Slowest [# Visits]',
              userStats: sort(
                statsStore.userStats,
                'max501DoubleVisits',
                0,
                false
              ),
            },
          ]
      }
    case 'rtc':
      return [
        {
          key: 'numRtcGames',
          text: 'Number of Games',
          userStats: sort(statsStore.userStats, 'numRtcGames', 0, false),
        },
        {
          key: 'avgRtcHitRateLast10',
          text: 'Average Hit Rate Last 10 Games',
          userStats: sort(
            statsStore.userStats,
            'avgRtcHitRateLast10',
            0,
            false
          ),
          transform: (n) => Math.round(n * 1000) / 10 + ' %',
        },
        {
          key: 'minRtcVisits',
          text: 'Fewest Visits',
          userStats: sort(statsStore.userStats, 'minRtcVisits', Infinity),
        },
        {
          key: 'maxRtcStreak',
          text: 'Longest Streak',
          userStats: sort(statsStore.userStats, 'maxRtcStreak', 0, false),
        },
      ]
    case 'killer':
      return [
        {
          key: 'numKillerGames',
          text: 'Number of Games',
          userStats: sort(statsStore.userStats, 'numKillerGames', 0, false),
        },
        {
          key: 'avgKillerResult',
          text: 'Win Rate [%]',
          userStats: sort(statsStore.userStats, 'avgKillerResult', 0, false),
          transform: (n) => Math.round(n * 10000) / 100 + ' %',
        },
      ]
  }
}

const sort = (
  userStats: UserStat[],
  key: keyof Omit<UserStat, 'userId'>,
  _default: number,
  ascending = true
) => {
  const sorted = userStats
    .filter((userStat) => userStat[key] != null && userStat[key] != 0)
    .toSorted((a, b) => (a[key] ?? _default) - (b[key] ?? _default))
  return ascending ? sorted : sorted.toReversed()
}
</script>
