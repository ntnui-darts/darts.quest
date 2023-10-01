<template>
  <p>
    <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
    <br />
    <span
      >{{ leg.type }}
      {{ ['Single', 'Double', 'Triple'][leg.finishType - 1] }} finish</span
    >
    {{ leg.visits.length }} visits
  </p>
  <canvas ref="chartElement"></canvas>
</template>

<script lang="ts" setup>
import { Leg } from '@/stores/game';
import { ref, onMounted } from 'vue';
import { Chart } from 'chart.js';

const props = defineProps<{
  leg: Leg;
}>();

const chartElement = ref<HTMLCanvasElement | null>(null);
const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];
const data = {
  labels: numbers,
  datasets: [
    {
      label: 'Hits',
      data: numbers.map(
        (n) => props.leg.visits.flat().filter((s) => s?.sector == n).length
      ),
      backgroundColor: ['rgba(20, 20, 40, 0.5)', 'rgba(250, 210, 160, 0.5)'],
    },
  ],
};
onMounted(() => {
  if (!chartElement.value) return;
  new Chart(chartElement.value, {
    type: 'polarArea',
    data: data,
    options: { plugins: { legend: { display: false } } },
  });
  chartElement.value.style.transform = 'rotate(-9deg)';
});
</script>
