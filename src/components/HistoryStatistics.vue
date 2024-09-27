<template>
  <PlayerSelection v-if="!userId" :players="players"></PlayerSelection>
  <h2>Game Type</h2>
  <GameSelection
    :game-type="gameType"
    :type-attributes="typeAttributes"
    @update-game-type="gameType = $event"
    @update-type-attributes="typeAttributes = $event"
  ></GameSelection>
  <div v-if="gameType == 'rtc'">
    <template v-if="!ignore?.includes('numberOfGames')">
      <h2>Number of Games</h2>
      <Chart
        :datasets="rtcNumberOfGamesDataset"
        :show-smooth-button="false"
      ></Chart>
    </template>
    <h2>Elo Rating</h2>
    <Chart :datasets="rtcEloDataset"></Chart>
    <h2>Hit Rate</h2>
    <Chart :datasets="rtcHitRateDataset"></Chart>
    <h2>RTC Streak</h2>
    <Chart :datasets="rtcStreakDataset"></Chart>
  </div>
  <div v-if="gameType == 'x01'">
    <template v-if="!ignore?.includes('numberOfGames')">
      <h2>Number of Games</h2>
      <Chart
        :datasets="x01NumberOfGamesDataset"
        :show-smooth-button="false"
      ></Chart>
    </template>
    <h2>Elo Rating</h2>
    <Chart :datasets="x01EloDataset"></Chart>
    <h2>First 9 Average</h2>
    <Chart :datasets="x01First9AvgDataset"></Chart>
    <h2>Checkout</h2>
    <Chart :datasets="x01CheckoutDataset"></Chart>
    <h2>Max Visit Score</h2>
    <Chart :datasets="x01MaxVisitScoreDataset"></Chart>
  </div>
  <div v-if="gameType == 'killer'">
    <template v-if="!ignore?.includes('numberOfGames')">
      <h2>Number of Games</h2>
      <Chart
        :datasets="killerNumberOfGamesDataset"
        :show-smooth-button="false"
      ></Chart>
    </template>
    <h2>Elo Rating</h2>
    <Chart :datasets="killerEloDataset"></Chart>
    <h2>Number of Darts</h2>
    <Chart :datasets="killerDartsDataset"></Chart>
  </div>
  <div v-if="gameType == 'skovhugger'">
    <template v-if="!ignore?.includes('numberOfGames')">
      <h2>Number of Games</h2>
      <Chart
        :datasets="skovhuggerNumberOfGamesDataset"
        :show-smooth-button="false"
      ></Chart>
    </template>
    <h2>Elo Rating</h2>
    <Chart :datasets="skovhuggerEloDataset"></Chart>
    <h2>Score</h2>
    <Chart :datasets="skovhuggerScoreDataset"></Chart>
  </div>
  <div v-if="gameType == 'cricket'">
    <template v-if="!ignore?.includes('numberOfGames')">
      <h2>Number of Games</h2>
      <Chart
        :datasets="cricketNumberOfGamesDataset"
        :show-smooth-button="false"
      ></Chart>
    </template>
    <h2>Elo Rating</h2>
    <Chart :datasets="cricketEloDataset"></Chart>
    <h2>Score</h2>
    <Chart :datasets="cricketScoreDataset"></Chart>
  </div>
</template>

<script lang="ts" setup>
import { GameType } from '@/games/games'
import { initialElo } from '@/stores/elo'
import {
  getAccumulatedDataset,
  getDataset,
  getNumberOfGamesDataset,
  useStatsStore,
} from '@/stores/stats'
import { computed, ref } from 'vue'
import Chart from './Chart.vue'
import GameSelection from './GameSelection.vue'
import PlayerSelection, { UserCurrentInfo } from './PlayerSelection.vue'

const props = defineProps<{
  userId?: string
  ignore?: string[]
}>()

const statsStore = useStatsStore()

const gameType = ref<GameType>('x01')
const typeAttributes = ref<string[]>([])
const players = ref<UserCurrentInfo[]>([])

const checkTypeAttribute = (ta: string, typeAttributes: string[]) =>
  typeAttributes.includes(ta) ||
  (ta.endsWith(':false') &&
    !typeAttributes.includes(`${ta.split(':')[0]}:true`))

const options = computed(() => ({}))

const hasSelectedPlayer = (
  stat: { legs: { userId: string } },
  players: UserCurrentInfo[]
) => {
  return (
    stat.legs.userId == props.userId ||
    players.some((p) => p.id == stat.legs.userId)
  )
}

const rtcStats = computed(() =>
  statsStore.rtcStats.filter(
    (stat) =>
      typeAttributes.value.every((ta) =>
        checkTypeAttribute(ta, stat.legs.typeAttributes)
      ) && hasSelectedPlayer(stat, players.value)
  )
)
const x01Stats = computed(() =>
  statsStore.x01Stats.filter(
    (stat) =>
      typeAttributes.value.every((ta) =>
        checkTypeAttribute(ta, stat.legs.typeAttributes)
      ) && hasSelectedPlayer(stat, players.value)
  )
)
const killerStats = computed(() =>
  statsStore.killerStats.filter(
    (stat) =>
      typeAttributes.value.every((ta) =>
        checkTypeAttribute(ta, stat.legs.typeAttributes)
      ) && hasSelectedPlayer(stat, players.value)
  )
)
const skovhuggerStats = computed(() =>
  statsStore.skovhuggerStats.filter(
    (stat) =>
      typeAttributes.value.every((ta) =>
        checkTypeAttribute(ta, stat.legs.typeAttributes)
      ) && hasSelectedPlayer(stat, players.value)
  )
)
const cricketStats = computed(() =>
  statsStore.cricketStats.filter(
    (stat) =>
      typeAttributes.value.every((ta) =>
        checkTypeAttribute(ta, stat.legs.typeAttributes)
      ) && hasSelectedPlayer(stat, players.value)
  )
)

const rtcUsers = computed(() =>
  props.userId
    ? [props.userId]
    : Array.from(new Set(rtcStats.value.map((s) => s.legs.userId)))
)
const rtcNumberOfGamesDataset = computed(() => {
  return getNumberOfGamesDataset(rtcUsers.value, rtcStats.value, options.value)
})
const rtcHitRateDataset = computed(() => {
  return getDataset(
    rtcUsers.value,
    rtcStats.value,
    (stat) => stat.hitRate,
    options.value
  )
})
const rtcStreakDataset = computed(() => {
  return getDataset(
    rtcUsers.value,
    rtcStats.value,
    (stat) => stat.maxStreak,
    options.value
  )
})
const rtcEloDataset = computed(() => {
  return getAccumulatedDataset(
    rtcUsers.value,
    statsStore.rtcStats,
    (stat) => stat.eloDelta,
    initialElo,
    options.value
  )
})

const x01Users = computed(() =>
  props.userId
    ? [props.userId]
    : Array.from(new Set(x01Stats.value.map((s) => s.legs.userId)))
)
const x01NumberOfGamesDataset = computed(() => {
  return getNumberOfGamesDataset(x01Users.value, x01Stats.value, options.value)
})
const x01First9AvgDataset = computed(() => {
  return getDataset(
    x01Users.value,
    x01Stats.value,
    (stat) => stat.first9Avg,
    options.value
  )
})
const x01CheckoutDataset = computed(() => {
  return getDataset(
    x01Users.value,
    x01Stats.value,
    (stat) => stat.checkout,
    options.value
  )
})
const x01MaxVisitScoreDataset = computed(() => {
  return getDataset(
    x01Users.value,
    x01Stats.value,
    (stat) => stat.maxVisitScore,
    options.value
  )
})
const x01EloDataset = computed(() => {
  return getAccumulatedDataset(
    x01Users.value,
    statsStore.x01Stats,
    (stat) => stat.eloDelta,
    initialElo,
    options.value
  )
})

const killerUsers = computed(() =>
  props.userId
    ? [props.userId]
    : Array.from(new Set(killerStats.value.map((s) => s.legs.userId)))
)
const killerNumberOfGamesDataset = computed(() => {
  return getNumberOfGamesDataset(
    killerUsers.value,
    killerStats.value,
    options.value
  )
})
const killerDartsDataset = computed(() => {
  return getDataset(
    killerUsers.value,
    killerStats.value,
    (stat) => stat.darts,
    options.value
  )
})
const killerEloDataset = computed(() => {
  return getAccumulatedDataset(
    killerUsers.value,
    statsStore.killerStats,
    (stat) => stat.eloDelta,
    initialElo,
    options.value
  )
})

const skovhuggerUsers = computed(() =>
  props.userId
    ? [props.userId]
    : Array.from(new Set(skovhuggerStats.value.map((s) => s.legs.userId)))
)
const skovhuggerNumberOfGamesDataset = computed(() => {
  return getNumberOfGamesDataset(
    skovhuggerUsers.value,
    skovhuggerStats.value,
    options.value
  )
})
const skovhuggerScoreDataset = computed(() => {
  return getDataset(
    skovhuggerUsers.value,
    skovhuggerStats.value,
    (stat) => stat.score,
    options.value
  )
})
const skovhuggerEloDataset = computed(() => {
  return getAccumulatedDataset(
    skovhuggerUsers.value,
    statsStore.skovhuggerStats,
    (stat) => stat.eloDelta,
    initialElo,
    options.value
  )
})

const cricketUsers = computed(() =>
  props.userId
    ? [props.userId]
    : Array.from(new Set(cricketStats.value.map((s) => s.legs.userId)))
)
const cricketNumberOfGamesDataset = computed(() => {
  return getNumberOfGamesDataset(
    cricketUsers.value,
    cricketStats.value,
    options.value
  )
})
const cricketScoreDataset = computed(() => {
  return getDataset(
    cricketUsers.value,
    cricketStats.value,
    (stat) => stat.score,
    options.value
  )
})
const cricketEloDataset = computed(() => {
  return getAccumulatedDataset(
    cricketUsers.value,
    statsStore.cricketStats,
    (stat) => stat.eloDelta,
    initialElo,
    options.value
  )
})
</script>
