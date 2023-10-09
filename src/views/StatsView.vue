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
      <DartboardChart
        :visits="
          statsStore.legs
            .filter((leg) => ['301', '501', '701'].includes(leg.type))
            .map((leg) => leg.visits)
            .flat()
        "
        :width="220"
        :height="220"
        title="X01"
      ></DartboardChart>
    </div>
    <h3>Number of Visits</h3>
    <LegHistoryChart
      :legs="statsStore.legs"
      :y="(leg) => leg.visits.length"
      :group-by-type="true"
    ></LegHistoryChart>
    <h3>First 9 Average</h3>
    <LegHistoryChart
      :legs="statsStore.legs"
      :y="
        (leg) =>
          getFirst9Avg(leg.visits, leg.type, getTypeAttribute(leg, 'finish', 1))
      "
      :group-by-type="false"
      :filter="(leg) => ['301', '501', '701'].includes(leg.type)"
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
import { getTypeAttribute } from '@/types/game'

const statsStore = useStatsStore()
</script>
