<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <div>
    <div class="row spaced">
      <div>
        <h2>Stats</h2>
        <p>
          {{ statsStore.getNumberOfWins }} wins. <br />
          {{ statsStore.getNumberOfLosses }} losses. <br />
          {{ statsStore.getNumberOfSoloGames }} solo games. <br />
        </p>
      </div>
      <DartboardChart
        :visits="statsStore.legs.map((leg) => leg.visits).flat()"
        :width="300"
        :height="300"
      ></DartboardChart>
    </div>
    <h3>Number of Visits</h3>
    <LegHistoryChart
      :legs="statsStore.legs"
      :y="(leg) => leg.visits.length"
    ></LegHistoryChart>
    <h3>First 9 Average</h3>
    <LegHistoryChart
      :legs="statsStore.legs"
      :y="(leg, type, finishType) => getFirst9Avg(leg.visits, type, finishType)"
    ></LegHistoryChart>
    <h3>History</h3>
    <div v-for="leg in statsStore.legs.toReversed()">
      <LegStats :leg="leg"></LegStats>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LegStats from '@/components/LegStats.vue';
import DartboardChart from '@/components/DartboardChart.vue';
import LegHistoryChart from '@/components/LegHistoryChart.vue';
import { router } from '@/router';
import { useStatsStore } from '@/stores/stats';
import { getFirst9Avg } from '@/stores/game';

const statsStore = useStatsStore();
</script>
