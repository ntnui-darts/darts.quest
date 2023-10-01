<template>
  <canvas ref="chartElement"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { Chart } from 'chart.js';
import { Visit } from '@/stores/game';

const props = defineProps<{
  visits: Visit[];
  width?: number;
  height?: number;
}>();

const chartElement = ref<HTMLCanvasElement | null>(null);
const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];
let chart: Chart<any> | null = null;

onMounted(() => {
  buildChart();
});

watch(
  () => props.visits,
  () => buildChart()
);

const buildChart = () => {
  if (!chartElement.value) return;
  const data = {
    labels: numbers,
    datasets: [
      {
        label: 'Hits',
        data: numbers.map(
          (n) => props.visits.flat().filter((s) => s?.sector == n).length
        ),
        backgroundColor: ['rgba(20, 20, 40, 0.5)', 'rgba(250, 210, 160, 0.5)'],
      },
    ],
  };
  chart?.destroy();
  chart = new Chart(chartElement.value, {
    type: 'polarArea',
    data: data,
    options: {
      plugins: { legend: { display: false } },
      layout: { padding: 25 },
    },
  });
  chartElement.value.style.transform = 'rotate(-9deg)';
  if (props.width && props.height) {
    chart.resize(props.width, props.height);
  }
};
</script>
