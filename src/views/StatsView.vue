<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <div>
    <h2>Stats</h2>
    <p>
      {{ statsStore.getNumberOfWins }} wins. <br />
      {{ statsStore.getNumberOfLosses }} losses. <br />
      {{ statsStore.getNumberOfSoloGames }} solo games. <br />
    </p>
    <h3># of Turns</h3>
    <canvas ref="chartElement"></canvas>
    <h3>History</h3>
    <div v-for="leg in statsStore.legs">
      <p>
        {{ leg.createdAt ? new Date(leg.createdAt).toDateString() : null }}
        - {{ leg.type }}, {{ leg.visits?.length }} turns - Confirmed:
        {{ leg.confirmed }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { onMounted, ref } from 'vue';
import { useStatsStore } from '@/stores/stats';
import { Chart } from 'chart.js';
import { GameType } from '@/stores/game';

const statsStore = useStatsStore();

const chartElement = ref<HTMLCanvasElement | null>(null);

const legsOfType = (type: GameType, finishType: 1 | 2 | 3) => {
  return statsStore.legs.filter(
    (leg) => leg.finish && leg.type == type && leg.finishType == finishType
  );
};

onMounted(async () => {
  await statsStore.fetchLegs();
  await statsStore.fetchGames();
  if (!chartElement.value) return;

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
            x: leg.createdAt?.split('.')[0],
            y: leg.visits.length,
          })),
        });
      }
    }
  }

  new Chart(chartElement.value, {
    type: 'line',
    data: {
      datasets,
    },
  });
});
</script>
