<template>
  <div class="row spaced">
    <div>
      <p style="min-width: 100px">
        {{ statsStore.getNumberOfWins }} wins. <br />
        {{ statsStore.getNumberOfLosses }} losses. <br />
        {{ statsStore.getNumberOfSoloGames }} solo games. <br />
      </p>
    </div>
  </div>
  <div class="row options" style="position: sticky; top: 1em; z-index: 10">
    <button
      v-for="days in ([7, 30, 365] as const)"
      @click="setLastDays(days)"
      :class="{ selected: selected == days }"
    >
      Last {{ days }} days
    </button>
  </div>
  <div class="row" style="align-items: center">
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
  </div>
  <DartboardChart
    :visits="
      legs
        .filter((leg) => leg.type == 'x01')
        .map((leg) => leg.visits)
        .flat()
    "
    :width="300"
    :height="300"
    stat-type="x01"
    title="X01"
  ></DartboardChart>
  <DartboardChart
    :visits="
      legs
        .filter((leg) => leg.type == 'rtc')
        .map((leg) => leg.visits)
        .flat()
    "
    :width="300"
    :height="300"
    stat-type="rtc"
    title="RTC"
  ></DartboardChart>
  <h3>X01 Number of Visits</h3>
  <LegHistoryChart
    :legs="legs"
    :y="(leg) => leg.visits.length"
    :group-by-type="true"
  ></LegHistoryChart>
  <h3>First 9 Average</h3>
  <LegHistoryChart
    :legs="legs.filter((leg) => leg.type == 'x01')"
    :y="(leg) => getFirst9Avg(leg.visits, leg)"
    :group-by-type="false"
  ></LegHistoryChart>
  <h3>RTC Hit rate</h3>
  <LegHistoryChart
    :legs="legs.filter((leg) => leg.type == 'rtc')"
    :y="
      (leg) =>
        rtcStats(leg.visits).filter((x) => x != 0).length /
        leg.visits.flat().length
    "
    :group-by-type="false"
  ></LegHistoryChart>
  <br />
  <br />
  <!-- <h3>History</h3>
  <div v-for="leg in legs.toReversed()">
    <LegStats :leg="leg"></LegStats>
  </div> -->
</template>

<script lang="ts" setup>
// import LegStats from '@/components/LegStats.vue'
import DartboardChart from '@/components/DartboardChart.vue'
import LegHistoryChart from '@/components/LegHistoryChart.vue'
import { useStatsStore } from '@/stores/stats'
import { getFirst9Avg } from '@/games/x01'
import { rtcStats } from '@/games/rtc'
import { ref, computed, onMounted } from 'vue'

const toYyyyMmDd = (date: Date) => date.toISOString().split('T')[0]

const statsStore = useStatsStore()
const startDate = ref('2023-10-01')
const endDate = ref(toYyyyMmDd(new Date()))
const selected = ref<7 | 30 | 365 | 'other'>(365)

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const setLastDays = (days: 7 | 30 | 365) => {
  endDate.value = toYyyyMmDd(addDays(new Date(), 1))
  startDate.value = toYyyyMmDd(addDays(new Date(), -days))
  selected.value = days
}

onMounted(() => {
  setLastDays(365)
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
</script>
