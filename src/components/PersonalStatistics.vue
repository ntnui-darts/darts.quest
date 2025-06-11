<template>
  <h2>Elo Rating</h2>
  <table v-if="userId">
    <thead>
      <th>Game Type</th>
      <th>Elo Rating</th>
    </thead>
    <tbody>
      <tr v-for="(value, name) in personalElo">
        <td>{{ GameTypeNames[name] }}</td>
        <td>{{ Math.round(value ?? initialElo) }}</td>
      </tr>
    </tbody>
  </table>

  <h2>Number of Games</h2>
  <Chart :datasets="numberOfGamesDataset" :show-smooth-button="false"></Chart>
  <h2>Dartboard Distribution</h2>
  <div class="row options">
    <button
      v-for="type in ['X01', 'Round the Clock']"
      @click="selectedDartboardchart = type"
      :class="{ selected: selectedDartboardchart == type }"
    >
      {{ type }}
    </button>
  </div>
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
  <DartboardChart
    :visits="selectedVisits"
    :width="300"
    :height="300"
    :stat-type="selectedStatType"
  ></DartboardChart>

  <h2>Last 10 Games</h2>
  <div v-for="leg in legs.slice(-10).toReversed()">
    <LegStats :leg="leg" :game="gameMap.get(leg.gameId)"></LegStats>
  </div>
</template>

<script lang="ts" setup>
import DartboardChart from '@/components/DartboardChart.vue'
import LegStats from '@/components/LegStats.vue'
import { GameType, GameTypeNames } from '@/games/games'
import { useAuthStore } from '@/stores/auth'
import { initialElo, useEloStore } from '@/stores/elo'
import { useStatsStore } from '@/stores/stats'
import { getTypeAttribute, Visit } from '@/types/game'
import { addDays } from 'date-fns'
import { computed, onMounted, ref } from 'vue'
import Chart from './LineChart.vue'
import { useTournamentStore } from '@/stores/tournament'

const toYyyyMmDd = (date: Date) => date.toISOString().split('T')[0]

const statsStore = useStatsStore()
const eloStore = useEloStore()
const tournamentStore = useTournamentStore()

const startDate = ref('2023-10-01')
const endDate = ref(toYyyyMmDd(new Date()))
const selected = ref<7 | 30 | 365 | 'other'>(365)
const selectedDartboardchart = ref<string>('X01')
const rtcModeDartboard = ref('1')
const startScore = ref('All')

const setLastDays = (days: 7 | 30 | 365) => {
  endDate.value = toYyyyMmDd(addDays(new Date(), 1))
  startDate.value = toYyyyMmDd(addDays(new Date(), -days))
  selected.value = days
}

const selectedVisits = computed<Visit[]>(() => {
  if (selectedDartboardchart.value == 'X01') {
    return x01Visits.value ?? []
  } else if (selectedDartboardchart.value == 'Round the Clock') {
    return rtcVisitsDartboard.value ?? []
  } else return []
})

const selectedStatType = computed<GameType>(() => {
  return dartboardChartTypeMap[selectedDartboardchart.value] ?? 'x01'
})

const userId = computed(() => useAuthStore().auth?.id)
const personalElo = computed(() => {
  if (!eloStore.personalElo) return null

  return {
    x01: eloStore.personalElo.x01,
    cricket: eloStore.personalElo.cricket,
    killer: eloStore.personalElo.killer,
    rtc: eloStore.personalElo.rtc,
    skovhugger: eloStore.personalElo.skovhugger,
  } satisfies Record<GameType, number | null>
})

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

onMounted(async () => {
  setLastDays(7)
  tournamentStore.fetchTournaments()
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

const games = computed(() => {
  return statsStore.games.filter((game) => {
    const time = new Date(game.createdAt).getTime()
    return (
      (!startDate.value || new Date(startDate.value).getTime() <= time) &&
      (!endDate.value || time <= new Date(endDate.value).getTime())
    )
  })
})

const gameMap = computed(() => {
  return new Map(games.value.map((game) => [game.id, game]))
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

const dartboardChartTypeMap: Record<string, GameType> = {
  X01: 'x01',
  'Round the Clock': 'rtc',
}
</script>
