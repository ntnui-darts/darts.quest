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
        :width="400"
        :height="400"
      ></DartboardChart>
    </div>
    <h3>Number of Visits</h3>
    <canvas ref="chartElement"></canvas>
    <h3>History</h3>
    <div v-for="leg in statsStore.legs.toReversed()">
      <LegStats :leg="leg"></LegStats>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LegStats from '@/components/LegStats.vue';
import { router } from '@/router';
import { watch, ref, onMounted } from 'vue';
import { useStatsStore } from '@/stores/stats';
import { Chart } from 'chart.js';
import { GameType } from '@/stores/game';
import 'chartjs-adapter-date-fns';
import DartboardChart from '@/components/DartboardChart.vue';

const statsStore = useStatsStore();

const chartElement = ref<HTMLCanvasElement | null>(null);
let chart: Chart<any> | null = null;

const legsOfType = (type: GameType, finishType: 1 | 2 | 3) => {
  return statsStore.legs.filter(
    (leg) => leg.finish && leg.type == type && leg.finishType == finishType
  );
};

const buildChart = async () => {
  if (!chartElement.value || statsStore.legs.length == 0) return;
  const datasets = [];
  for (const type of ['301', '501', '701'] as const) {
    for (const [finishType, finishTypeText] of [
      [1, 'Single'],
      [2, 'Double'],
      [3, 'Triple'],
    ] as const) {
      const legs = legsOfType(type, finishType);
      if (legs.length > 0) {
        datasets.push({
          label: `${type} ${finishTypeText}`,
          data: legs.map((leg) => ({
            x: new Date(leg.createdAt),
            y: leg.visits.length,
          })),
        });
      }
    }
  }

  chart?.destroy();
  chart = new Chart(chartElement.value, {
    type: 'line',
    data: {
      datasets,
    },
    options: {
      scales: {
        x: {
          type: 'time',
        },
      },
    },
  });
};

onMounted(() => {
  buildChart();
});

watch(
  () => statsStore.legs,
  () => buildChart()
);
</script>
