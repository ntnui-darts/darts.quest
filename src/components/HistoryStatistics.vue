<template>
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
  <div v-if="gameType == 'rtc'">
    <h2>RTC Hit Rate</h2>
    <Chart :datasets="rtcHitRateDataset"></Chart>
    <h2>RTC Streak</h2>
    <Chart :datasets="rtcStreakDataset"></Chart>
  </div>
  <div v-if="gameType == 'x01'">
    <h2>First 9 Average</h2>
    <Chart :datasets="x01First9AvgDataset"></Chart>
    <h2>Checkout</h2>
    <Chart :datasets="x01CheckoutDataset"></Chart>
    <h2>Max Visit Score</h2>
    <Chart :datasets="x01MaxVisitScoreDataset"></Chart>
  </div>
  <div v-if="gameType == 'killer'">
    <h2>Number of Darts</h2>
    <Chart :datasets="killerDartsDataset"></Chart>
  </div>
</template>

<script lang="ts" setup>
import { GameType, GameTypeNames } from '@/games/games'
import Chart from './Chart.vue'
import { useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { computed, ref } from 'vue'

const statsStore = useStatsStore()
const userStore = useUsersStore()

const gameType = ref<GameType>('x01')

const rtcUsers = computed(() =>
  Array.from(new Set(statsStore.rtcStats.map((s) => s.legs.userId)))
)
const rtcHitRateDataset = computed(() => {
  return rtcUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.rtcStats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.hitRate })),
  }))
})
const rtcStreakDataset = computed(() => {
  return rtcUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.rtcStats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.maxStreak })),
  }))
})

const x01Users = computed(() =>
  Array.from(new Set(statsStore.x01Stats.map((s) => s.legs.userId)))
)
const x01First9AvgDataset = computed(() => {
  return x01Users.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.x01Stats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.first9Avg })),
  }))
})
const x01CheckoutDataset = computed(() => {
  return x01Users.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.x01Stats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.checkout,
      })),
  }))
})
const x01MaxVisitScoreDataset = computed(() => {
  return x01Users.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.x01Stats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.maxVisitScore,
      })),
  }))
})

const killerUsers = computed(() =>
  Array.from(new Set(statsStore.killerStats.map((s) => s.legs.userId)))
)
const killerDartsDataset = computed(() => {
  return killerUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: statsStore.killerStats
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.darts,
      })),
  }))
})
</script>
