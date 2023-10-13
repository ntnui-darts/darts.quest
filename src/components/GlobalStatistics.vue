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
  <div v-for="stat in stats[gameType]" class="col">
    <h3>{{ stat.text }}</h3>
    <table>
      <tbody>
        <tr v-for="(userStat, i) in stat.userStats">
          <td>
            {{ i + 1 }}. {{ useUsersStore().getUser(userStat.userId)?.name }}
          </td>
          <td style="text-align: end">
            {{ Math.round((userStat[stat.key] ?? 0) * 10) / 10 }}
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
import { computed, ref } from 'vue'
import { useStatsStore, UserStat } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { GameType, GameTypeNames } from '@/types/game'

const statsStore = useStatsStore()

const gameType = ref<GameType>('x01')

const stats = computed(
  () =>
    ({
      x01: [
        {
          key: 'min301DoubleVisits',
          text: 'Fastest 301 Double Finish',
          userStats: sort(statsStore.userStats, 'min301DoubleVisits', Infinity),
        },
        {
          key: 'min501DoubleVisits',
          text: 'Fastest 501 Double Finish',
          userStats: sort(statsStore.userStats, 'min501DoubleVisits', Infinity),
        },
        {
          key: 'maxX01First9Avg',
          text: 'Highest X01 First 9 Average',
          userStats: sort(statsStore.userStats, 'maxX01First9Avg', 0, false),
        },
        {
          key: 'maxX01DoubleCheckout',
          text: 'Highest X01 Double Checkout',
          userStats: sort(
            statsStore.userStats,
            'maxX01DoubleCheckout',
            0,
            false
          ),
        },
        {
          key: 'maxX01VisitScore',
          text: 'Highest X01 Single Visit Score',
          userStats: sort(statsStore.userStats, 'maxX01VisitScore', 0, false),
        },
        {
          key: 'numX01Games',
          text: 'Number of X01 Games',
          userStats: sort(statsStore.userStats, 'numX01Games', 0, false),
        },
      ],
      rtc: [
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
        {
          key: 'numRtcGames',
          text: 'Number of RTC Games',
          userStats: sort(statsStore.userStats, 'numRtcGames', 0, false),
        },
      ],
    } satisfies Record<
      GameType,
      { key: keyof UserStat; text: string; userStats: UserStat[] }[]
    >)
)

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
