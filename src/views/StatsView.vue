<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <div>
    <div class="row spaced">
      <div>
        <h2>Stats</h2>
        <p style="min-width: 100px">
          {{ statsStore.getNumberOfWins }} wins. <br />
          {{ statsStore.getNumberOfLosses }} losses. <br />
          {{ statsStore.getNumberOfSoloGames }} solo games. <br />
        </p>
      </div>
    </div>
    <DartboardChart
      :visits="
        statsStore.legs
          .filter((leg) => ['301', '501', '701'].includes(leg.type))
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
        statsStore.legs
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
      :legs="statsStore.legs"
      :y="(leg) => leg.visits.length"
      :group-by-type="true"
    ></LegHistoryChart>
    <h3>First 9 Average</h3>
    <LegHistoryChart
      :legs="
        statsStore.legs.filter((leg) =>
          ['301', '501', '701'].includes(leg.type)
        )
      "
      :y="(leg) => getFirst9Avg(leg.visits, leg)"
      :group-by-type="false"
    ></LegHistoryChart>
    <h3>RTC Hit rate</h3>
    <LegHistoryChart
      :legs="statsStore.legs.filter((leg) => leg.type == 'rtc')"
      :y="
        (leg) =>
          rtcStats(leg.visits).filter((x) => x != 0).length /
          leg.visits.flat().length
      "
      :group-by-type="false"
    ></LegHistoryChart>
    <h3>History</h3>
    <div v-for="leg in statsStore.legs.toReversed()">
      <LegStats :leg="leg"></LegStats>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LegStats from '@/components/LegStats.vue'
import DartboardChart from '@/components/DartboardChart.vue'
import LegHistoryChart from '@/components/LegHistoryChart.vue'
import { router } from '@/router'
import { useStatsStore } from '@/stores/stats'
import { getFirst9Avg } from '@/games/x01'
import { rtcStats } from '@/games/rtc'

const statsStore = useStatsStore()
</script>
