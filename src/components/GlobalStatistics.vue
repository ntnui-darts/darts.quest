<template>
  <br />
  <div v-for="stat in stats" class="col">
    <h3>{{ stat.text }}</h3>
    <table>
      <tbody>
        <tr v-for="(userStat, i) in stat.userStats">
          <td>
            {{ i + 1 }}. {{ useUsersStore().getUser(userStat.userId)?.name }}
          </td>
          <td style="text-align: end">{{ userStat[stat.key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <br />
  <br />
  <br />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStatsStore, UserStat } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'

const statsStore = useStatsStore()

const stats = computed(
  () =>
    [
      {
        key: 'min301DoubleVisits',
        text: 'Min 301-Double Visits',
        userStats: sort(statsStore.userStats, 'min301DoubleVisits', Infinity),
      },
      {
        key: 'minRtcVisits',
        text: 'Min RTC Visits',
        userStats: sort(statsStore.userStats, 'minRtcVisits', Infinity),
      },
      {
        key: 'maxRtcStreak',
        text: 'Max RTC Streak',
        userStats: sort(statsStore.userStats, 'maxRtcStreak', 0, false),
      },
      {
        key: 'maxX01VisitScore',
        text: 'Max X01 Single Visit Score',
        userStats: sort(statsStore.userStats, 'maxX01VisitScore', 0, false),
      },
    ] satisfies { key: keyof UserStat; text: string; userStats: UserStat[] }[]
)

const sort = (
  userStats: UserStat[],
  key: keyof Omit<UserStat, 'userId'>,
  _default: number,
  ascending = true
) => {
  const sorted = userStats.toSorted(
    (a, b) => (a[key] ?? _default) - (b[key] ?? _default)
  )
  return ascending ? sorted : sorted.toReversed()
}
</script>
