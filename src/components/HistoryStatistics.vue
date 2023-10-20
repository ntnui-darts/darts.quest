<template>
  <h2>Game Type</h2>
  <div
    class="col"
    style="gap: 0; background-color: rgb(43, 43, 43); border-radius: 0.5em"
  >
    <div class="row options">
      <button
        v-for="(name, type) in GameTypeNames"
        :class="{ selected: type == gameType }"
        style="font-size: larger"
        @click="gameType = type"
      >
        {{ name }}
      </button>
    </div>
    <div v-auto-animate class="col" style="padding: 1em">
      <component
        v-if="getOptionsComponent(gameType)"
        :is="getOptionsComponent(gameType)"
        :key="gameType"
        :type-attributes="typeAttributes"
        @update="typeAttributes = $event"
      ></component>
    </div>
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
import { GameType, GameTypeNames, getOptionsComponent } from '@/games/games'
import Chart from './Chart.vue'
import { useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { computed, ref } from 'vue'

const statsStore = useStatsStore()
const userStore = useUsersStore()

const gameType = ref<GameType>('x01')
const typeAttributes = ref<string[]>([])

const rtcStats = computed(() =>
  statsStore.rtcStats.filter((stat) =>
    typeAttributes.value.every((ta) => stat.legs.typeAttributes.includes(ta))
  )
)
const x01Stats = computed(() =>
  statsStore.x01Stats.filter((stat) =>
    typeAttributes.value.every((ta) => stat.legs.typeAttributes.includes(ta))
  )
)
const killerStats = computed(() =>
  statsStore.killerStats.filter((stat) =>
    typeAttributes.value.every((ta) => stat.legs.typeAttributes.includes(ta))
  )
)

const rtcUsers = computed(() =>
  Array.from(new Set(statsStore.rtcStats.map((s) => s.legs.userId)))
)
const rtcHitRateDataset = computed(() => {
  return rtcUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: rtcStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.hitRate })),
  }))
})
const rtcStreakDataset = computed(() => {
  return rtcUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: rtcStats.value
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
    data: x01Stats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.first9Avg })),
  }))
})
const x01CheckoutDataset = computed(() => {
  return x01Users.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: x01Stats.value
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
    data: x01Stats.value
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
    data: killerStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.darts,
      })),
  }))
})
</script>