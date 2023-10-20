<template>
  <div style="position: relative; width: auto; height: 500px">
    <button
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

type Point = { x: Date; y: number | null }
const props = defineProps<{
  datasets: ChartDataset<'line', Point[]>[]
}>()

const chartElement = ref<HTMLCanvasElement | null>(null)
const smoothEnabled = ref(false)
let chart: Chart<any> | null = null

const smoothPoints = (points: Point[]) => {
  const smoothed: Point[] = []

  for (const a of points) {
    let sumWeights = 0
    let y = 0
    for (const b of points) {
      const distance = Math.max(
        1,
        Math.pow(Math.abs(a.x.getTime() - b.x.getTime()) / 5e7, 2)
      )
      const weight = 1 / distance
      sumWeights += weight
      y += (b.y ?? 0) * weight
    }
    smoothed.push({ x: a.x, y: y / sumWeights })
  }
  return smoothed
}

const buildChart = async () => {
  if (!chartElement.value) return

  const datasets = props.datasets.map((dataset) => ({
    label: dataset.label,
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
