<template>
  <div style="position: relative; width: auto; height: 500px">
    <button
      v-if="showSmoothButton"
      style="position: absolute; right: 0; top: -3em"
      :class="{ selected: smoothEnabled }"
      @click="smoothEnabled = !smoothEnabled"
    >
      Smooth
    </button>
    <canvas ref="chartElement"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted } from 'vue'
import { Chart, ChartDataset } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Point, smoothPoints } from './chart'

const props = withDefaults(
  defineProps<{
    datasets: ChartDataset<'line', Point[]>[]
    showSmoothButton?: boolean
  }>(),
  { showSmoothButton: true }
)

const chartElement = ref<HTMLCanvasElement | null>(null)
const smoothEnabled = ref(props.showSmoothButton)
let chart: Chart<any> | null = null

const buildChart = async () => {
  if (!chartElement.value) return

  const datasets = props.datasets
    .filter((data) => data.data.length > 0)
    .map((dataset) => ({
      ...dataset,
      data: smoothEnabled.value ? smoothPoints(dataset.data) : dataset.data,
    }))

  if (chart) {
    chart.data.datasets = datasets
    chart.update()
    return
  }

  chart = new Chart(chartElement.value, {
    type: 'line',
    data: {
      datasets,
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
        },
      },
    },
  })
}

onMounted(() => {
  buildChart()
})

watch(
  () => [props.datasets, smoothEnabled.value],
  () => buildChart()
)
</script>
