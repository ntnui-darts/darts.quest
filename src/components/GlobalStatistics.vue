<template>
  <br />
  <h3>Min 301-Double Visits</h3>
  <table>
    <tbody>
      <tr
        v-for="userStat in sort(
          statsStore.userStats,
          'min301DoubleVisits',
          Infinity
        )"
      >
        <td>{{ useUsersStore().getUser(userStat.userId)?.name }}</td>
        <td>{{ userStat.min301DoubleVisits }}</td>
      </tr>
    </tbody>
  </table>

  <h3>Min RTC Visits</h3>
  <table>
    <tbody>
      <tr
        v-for="userStat in sort(statsStore.userStats, 'minRtcVisits', Infinity)"
      >
        <td>{{ useUsersStore().getUser(userStat.userId)?.name }}</td>
        <td>{{ userStat.minRtcVisits }}</td>
      </tr>
    </tbody>
  </table>

  <h3>Max RTC Streak</h3>
  <table>
    <tbody>
      <tr
        v-for="userStat in sort(statsStore.userStats, 'maxRtcStreak', 0, false)"
      >
        <td>{{ useUsersStore().getUser(userStat.userId)?.name }}</td>
        <td>{{ userStat.maxRtcStreak }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useStatsStore, UserStat } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'

const statsStore = useStatsStore()

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
