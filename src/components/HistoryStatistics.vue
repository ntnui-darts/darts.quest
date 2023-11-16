<template>
  <h2>Game Type</h2>
  <GameSelection
    :game-type="gameType"
    :type-attributes="typeAttributes"
    @update-game-type="gameType = $event"
    @update-type-attributes="typeAttributes = $event"
  ></GameSelection>
  <div v-if="gameType == 'rtc'">
    <h2>Number of Games</h2>
    <Chart
      :datasets="rtcNumberOfGamesDataset"
      :show-smooth-button="false"
    ></Chart>
    <h2>Hit Rate</h2>
    <Chart :datasets="rtcHitRateDataset"></Chart>
    <h2>Win Rate</h2>
    <Chart :datasets="rtcWinRateDataset"></Chart>
    <h2>RTC Streak</h2>
    <Chart :datasets="rtcStreakDataset"></Chart>
  </div>
  <div v-if="gameType == 'x01'">
    <h2>Number of Games</h2>
    <Chart
      :datasets="x01NumberOfGamesDataset"
      :show-smooth-button="false"
    ></Chart>
    <h2>Win Rate</h2>
    <Chart :datasets="x01WinRateDataset"></Chart>
    <h2>First 9 Average</h2>
    <Chart :datasets="x01First9AvgDataset"></Chart>
    <h2>Checkout</h2>
    <Chart :datasets="x01CheckoutDataset"></Chart>
    <h2>Max Visit Score</h2>
    <Chart :datasets="x01MaxVisitScoreDataset"></Chart>
  </div>
  <div v-if="gameType == 'killer'">
    <h2>Number of Games</h2>
    <Chart
      :datasets="killerNumberOfGamesDataset"
      :show-smooth-button="false"
    ></Chart>
    <h2>Win Rate</h2>
    <Chart :datasets="killerWinRateDataset"></Chart>
    <h2>Number of Darts</h2>
    <Chart :datasets="killerDartsDataset"></Chart>
  </div>
  <div v-if="gameType == 'skovhugger'">
    <h2>Number of Games</h2>
    <Chart
      :datasets="skovhuggerNumberOfGamesDataset"
      :show-smooth-button="false"
    ></Chart>
    <h2>Score</h2>
    <Chart :datasets="skovhuggerScoreDataset"></Chart>
    <h2>Win Rate</h2>
    <Chart :datasets="skovhuggerWinRateDataset"></Chart>
  </div>
</template>

<script lang="ts" setup>
import Chart from './Chart.vue'
import GameSelection from './GameSelection.vue'
import { GameType } from '@/games/games'
import { useStatsStore } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { computed, ref } from 'vue'

const statsStore = useStatsStore()
const userStore = useUsersStore()

const gameType = ref<GameType>('x01')
const typeAttributes = ref<string[]>([])

const checkTypeAttribute = (ta: string, typeAttributes: string[]) =>
  typeAttributes.includes(ta) ||
  (ta.endsWith(':false') &&
    !typeAttributes.includes(`${ta.split(':')[0]}:true`))

const rtcStats = computed(() =>
  statsStore.rtcStats.filter((stat) =>
    typeAttributes.value.every((ta) =>
      checkTypeAttribute(ta, stat.legs.typeAttributes)
    )
  )
)
const x01Stats = computed(() =>
  statsStore.x01Stats.filter((stat) =>
    typeAttributes.value.every((ta) =>
      checkTypeAttribute(ta, stat.legs.typeAttributes)
    )
  )
)
const killerStats = computed(() =>
  statsStore.killerStats.filter((stat) =>
    typeAttributes.value.every((ta) =>
      checkTypeAttribute(ta, stat.legs.typeAttributes)
    )
  )
)
const skovhuggerStats = computed(() =>
  statsStore.skovhuggerStats.filter((stat) =>
    typeAttributes.value.every((ta) =>
      checkTypeAttribute(ta, stat.legs.typeAttributes)
    )
  )
)

const rtcUsers = computed(() =>
  Array.from(new Set(statsStore.rtcStats.map((s) => s.legs.userId)))
)
const rtcNumberOfGamesDataset = computed(() => {
  return rtcUsers.value.map((user) => {
    let y = 1
    return {
      label: userStore.getUser(user)?.name ?? 'Unknown',
      data: rtcStats.value
        .filter((s) => s.legs.userId == user)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
})
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
const rtcWinRateDataset = computed(() => {
  return rtcUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: rtcStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({ x: new Date(stat.legs.createdAt), y: stat.winRate })),
  }))
})

const x01Users = computed(() =>
  Array.from(new Set(statsStore.x01Stats.map((s) => s.legs.userId)))
)
const x01NumberOfGamesDataset = computed(() => {
  return x01Users.value.map((user) => {
    let y = 1
    return {
      label: userStore.getUser(user)?.name ?? 'Unknown',
      data: x01Stats.value
        .filter((s) => s.legs.userId == user)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
})
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
      .filter((s) => s.legs.userId == user && (s.checkout ?? 0) > 0)
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
const x01WinRateDataset = computed(() => {
  return x01Users.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: x01Stats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.winRate,
      })),
  }))
})

const killerUsers = computed(() =>
  Array.from(new Set(statsStore.killerStats.map((s) => s.legs.userId)))
)
const killerNumberOfGamesDataset = computed(() => {
  return killerUsers.value.map((user) => {
    let y = 1
    return {
      label: userStore.getUser(user)?.name ?? 'Unknown',
      data: killerStats.value
        .filter((s) => s.legs.userId == user)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
})
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
const killerWinRateDataset = computed(() => {
  return killerUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: killerStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.winRate,
      })),
  }))
})

const skovhuggerUsers = computed(() =>
  Array.from(new Set(statsStore.skovhuggerStats.map((s) => s.legs.userId)))
)
const skovhuggerNumberOfGamesDataset = computed(() => {
  return skovhuggerUsers.value.map((user) => {
    let y = 1
    return {
      label: userStore.getUser(user)?.name ?? 'Unknown',
      data: skovhuggerStats.value
        .filter((s) => s.legs.userId == user)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
})
const skovhuggerScoreDataset = computed(() => {
  return skovhuggerUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: skovhuggerStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.score,
      })),
  }))
})
const skovhuggerWinRateDataset = computed(() => {
  return skovhuggerUsers.value.map((user) => ({
    label: userStore.getUser(user)?.name ?? 'Unknown',
    data: skovhuggerStats.value
      .filter((s) => s.legs.userId == user)
      .map((stat) => ({
        x: new Date(stat.legs.createdAt),
        y: stat.winRate,
      })),
  }))
})
</script>
