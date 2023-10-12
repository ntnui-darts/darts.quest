<template>
  <br />
  <table>
    <thead>
      <th>User</th>
      <th>RTC Streak</th>
    </thead>
    <tbody>
      <tr v-for="userStat in statsStore.userStats">
        <td>{{ useUsersStore().getUser(userStat.userId)?.name }}</td>
        <td>{{ userStat.rtcStreak }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'

const statsStore = useStatsStore()
</script>
