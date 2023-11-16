<template>
  <table v-if="userId">
    <thead>
      <th>Game Type</th>
      <th>Elo Rating</th>
    </thead>
    <tbody>
      <tr v-for="(value, name) in elo">
        <td>{{ name }}</td>
        <td>{{ Math.round(value) }}</td>
      </tr>
    </tbody>
  </table>

  <h2>Number of Games</h2>
  <Chart :datasets="numberOfGamesDataset" :show-smooth-button="false"></Chart>

  <h2>X01</h2>
  <div class="row options">
    <button
      v-for="option in ['All', '301', '501', '701']"
      :class="{ selected: startScore == option }"
      @click="startScore = option"
    >
      {{ option }}
    </button>
  </div>
  <DartboardChart
    :visits="x01Visits"
    :width="300"
    :height="300"
    stat-type="x01"
    title="X01"
  ></DartboardChart>

  <!-- style="position: sticky; top: 1em; z-index: 10"> -->
  <div class="row options">
    <button
      v-for="days in ([7, 30, 365] as const)"
      @click="setLastDays(days)"
      :class="{ selected: selected == days }"
    >
      Last {{ days }} days
    </button>
  </div>

  <!-- <div class="row" style="align-items: center">
    <input
      id="startDate"
      type="date"
      v-model="startDate"
      style="flex: 1"
      @change="selected = 'other'"
    />
    <span>→</span>
    <input
      id="endDate"
      type="date"
      v-model="endDate"
      style="flex: 1"
      @change="selected = 'other'"
    />
  </div> -->

  <h2>Round the Clock</h2>
  <div class="row options">
    <button
      v-for="(option, i) in ['All', '1', '2', '3']"
      :class="{ selected: rtcModeDartboard == option }"
      @click="rtcModeDartboard = option"
    >
      {{ ['All', 'Single', 'Double', 'Triple'][i] }}
    </button>
  </div>

  <DartboardChart
    :visits="rtcVisitsDartboard"
    :width="300"
    :height="300"
    stat-type="rtc"
    title="RTC"
  ></DartboardChart>

  <HistoryStatistics
    v-if="userId"
    :user-id="userId"
    :border-color="borderColor"
    :ignore="['numberOfGames']"
  ></HistoryStatistics>

  <h3>Last 10 Games</h3>
  <div v-for="leg in legs.slice(-10).toReversed()">
    <LegStats :leg="leg"></LegStats>
  </div>
</template>

<script lang="ts" setup>
import LegStats from '@/components/LegStats.vue'
import DartboardChart from '@/components/DartboardChart.vue'
import HistoryStatistics from './HistoryStatistics.vue'
import { useStatsStore } from '@/stores/stats'
import { ref, computed, onMounted } from 'vue'
import { getTypeAttribute } from '@/types/game'
import { addDays } from 'date-fns'
import { useAuthStore } from '@/stores/auth'
import Chart from './Chart.vue'
import { GameType, GameTypeNames } from '@/games/games'
import { useEloStore } from '@/stores/elo'

const toYyyyMmDd = (date: Date) => date.toISOString().split('T')[0]

const statsStore = useStatsStore()
const startDate = ref('2023-10-01')
const endDate = ref(toYyyyMmDd(new Date()))
const selected = ref<7 | 30 | 365 | 'other'>(365)
const rtcModeDartboard = ref('1')
const startScore = ref('All')
const borderColor = 'rgb(19, 221, 97)'

const setLastDays = (days: 7 | 30 | 365) => {
  endDate.value = toYyyyMmDd(addDays(new Date(), 1))
  startDate.value = toYyyyMmDd(addDays(new Date(), -days))
  selected.value = days
}

const userId = computed(() => useAuthStore().auth?.id)

const x01Legs = computed(() => legs.value.filter((leg) => leg.type == 'x01'))
const x01Visits = computed(() =>
  x01Legs.value
    .filter(
      (leg) =>
        startScore.value == 'All' ||
        getTypeAttribute(leg, 'startScore', '') == startScore.value
    )
    .map((leg) => leg.visits)
    .flat()
)
const rtcLegs = computed(() => legs.value.filter((leg) => leg.type == 'rtc'))

const rtcVisitsDartboard = computed(() =>
  rtcLegs.value
    .filter(
      (leg) =>
        rtcModeDartboard.value == 'All' ||
        getTypeAttribute(leg, 'mode', '') == rtcModeDartboard.value
    )
    .map((leg) => leg.visits)
    .flat()
)

const elo = ref<Record<string, number>>({})

onMounted(async () => {
  setLastDays(7)

  if (userId.value) {
    for (const gameType of ['x01', 'rtc', 'killer', 'skovhugger'] as const) {
      const name = GameTypeNames[gameType]
      elo.value[name] = await useEloStore().getElo(userId.value, gameType)
    }
  }
})

const legs = computed(() => {
  return statsStore.legs.filter((leg) => {
    const time = new Date(leg.createdAt).getTime()
    return (
      (!startDate.value || new Date(startDate.value).getTime() <= time) &&
      (!endDate.value || time <= new Date(endDate.value).getTime())
    )
  })
})

const numberOfGamesDataset = computed(() => {
  if (statsStore.loading) return []
  return Object.entries(GameTypeNames).map(([key, name]) => {
    let y = 1
    return {
      label: name,
      data: statsStore
        .getStats(key as GameType)
        .filter((s) => s.legs.userId == userId.value)
        .map((stat) => ({ x: new Date(stat.legs.createdAt), y: y++ })),
    }
  })
})
</script>
