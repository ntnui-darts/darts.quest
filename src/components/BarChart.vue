<template>
  <div style="position: relative; width: auto; height: 360px">
    <canvas ref="chartElement"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { Chart, ChartDataset } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  datasets: ChartDataset<'bar'>[]
  labels: (string | number)[]
}>()

const chartElement = ref<HTMLCanvasElement | null>(null)
let chart: Chart<any> | null = null

const buildChart = async () => {
  if (!chartElement.value) return

  let datasets = props.datasets.map((dataset) => ({
    ...dataset,
    data: dataset.data,
    cubicInterpolationMode: 'default',
    pointHoverRadius: 12,
    pointHitRadius: 12,
    borderRadius: 6,
  }))

  if (datasets.length == 1) {
    datasets[0].backgroundColor = 'rgb(19, 221, 97)'
  }

  if (chart) {
    chart.data.labels = props.labels
    chart.data.datasets = datasets
    chart.update()
    return
  }

  chart = new Chart(chartElement.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets,
    },
    options: {
      maintainAspectRatio: false,
    },
  })
}

onMounted(() => {
  buildChart()
})

watch(
  () => [props.datasets, props.labels],
  () => buildChart()
)
</script>
