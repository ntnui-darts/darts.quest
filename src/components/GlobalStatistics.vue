<template>
  <br />
  <table>
    <thead>
      <th>User</th>
      <th>Min 301-Double Visits</th>
      <th>Max RTC Streak</th>
      <th>Min RTC Visits</th>
    </thead>
    <tbody>
      <tr v-for="userStat in statsStore.userStats">
        <td>{{ useUsersStore().getUser(userStat.userId)?.name }}</td>
        <td>{{ userStat.min301DoubleVisits }}</td>
        <td>{{ userStat.maxRtcStreak }}</td>
        <td>{{ userStat.minRtcVisits }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'

const statsStore = useStatsStore()
</script>
