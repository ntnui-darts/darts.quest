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
  <h2>Round the Clock</h2>
  <div class="row options">
    <button
      v-for="(option, i) in ['All', '1', '2', '3']"
      :class="{ selected: rtcMode == option }"
      @click="rtcMode = option"
    >
      {{ ['All', 'Single', 'Double', 'Triple'][i] }}
    </button>
  </div>
  <DartboardChart
    :visits="rtcVisits"
    :width="300"
    :height="300"
    stat-type="rtc"
    title="RTC"
  ></DartboardChart>
  <div class="row spaced" style="align-items: center">
    <h3>X01 Number of Visits</h3>
    <button
      style="flex: 0 1"
      :class="{ selected: smooth }"
      @click="smooth = !smooth"
    >
      Smooth
    </button>
  </div>
  <LegHistoryChart
    :legs="legs"
    :y="(leg) => leg.visits.length"
    :group-by-type="true"
    :smooth="smooth"
  ></LegHistoryChart>
  <h3>First 9 Average</h3>
  <LegHistoryChart
    :legs="x01Legs"
    :y="(leg) => getFirst9Avg(leg.visits, leg)"
    :group-by-type="false"
    :smooth="true"
  ></LegHistoryChart>
  <h3>RTC Hit rate</h3>
  <LegHistoryChart
    :legs="rtcLegs"
    :y="(leg) => rtcHitRate(leg.visits)"
    :group-by-type="false"
    :smooth="true"
  ></LegHistoryChart>
  <br />
  <br />
  <h3>Last 10 Games</h3>
  <div v-for="leg in legs.slice(-10).toReversed()">
    <LegStats :leg="leg"></LegStats>
  </div>
</template>

<script lang="ts" setup>
import LegStats from '@/components/LegStats.vue'
import DartboardChart from '@/components/DartboardChart.vue'
import LegHistoryChart from '@/components/LegHistoryChart.vue'
import { useStatsStore } from '@/stores/stats'
import { getFirst9Avg } from '@/games/x01'
import { rtcHitRate } from '@/games/rtc'
import { ref, computed, onMounted } from 'vue'
import { getTypeAttribute } from '@/types/game'

const toYyyyMmDd = (date: Date) => date.toISOString().split('T')[0]

const statsStore = useStatsStore()
const startDate = ref('2023-10-01')
const endDate = ref(toYyyyMmDd(new Date()))
const selected = ref<7 | 30 | 365 | 'other'>(365)
const smooth = ref(false)
const rtcMode = ref('All')
const startScore = ref('All')

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
const rtcVisits = computed(() =>
  rtcLegs.value
    .filter(
      (leg) =>
        rtcMode.value == 'All' ||
        getTypeAttribute(leg, 'mode', '') == rtcMode.value
    )
    .map((leg) => leg.visits)
    .flat()
)

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
