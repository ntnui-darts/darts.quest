<template>
  <canvas ref="chartElement"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js'
import { Visit } from '@/types/game'
import { rtcStats } from '@/games/rtc'
import { GameType } from '@/games/games'

const props = defineProps<{
  visits: Visit[]
  width?: number
  height?: number
  statType: GameType
  title?: string
}>()

const chartElement = ref<HTMLCanvasElement | null>(null)
const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
]
let chart: Chart<any, any> | null = null

onMounted(() => {
  buildChart()
})
const x01Stats = (visits: Visit[]) =>
  numbers.map((n) => visits.flat().filter((s) => s?.sector == n).length)

watch(
  () => props.visits,
  () => buildChart()
)
const getData = () => {
  switch (props.statType) {
    case 'rtc':
      return rtcStats(props.visits)
    case 'x01':
      return x01Stats(props.visits)
  }
}
const getLabel = () => {
  switch (props.statType) {
    case 'rtc':
      return 'Hit Rate'
    case 'x01':
      return 'Hits'
  }
}

const buildChart = () => {
  if (!chartElement.value) return
  const data = {
    labels: numbers,
    datasets: [
      {
        label: getLabel(),
        data: getData(),
        backgroundColor: ['rgba(20, 20, 40, 0.5)', 'rgba(250, 210, 160, 0.5)'],
      },
    ],
  }

  chartElement.value.style.transform = 'rotate(-9deg)'

  if (chart) {
    chart.data.datasets = data.datasets
    chart.update()
    return
  }

  chart = new Chart(chartElement.value, {
    type: 'polarArea',
    data: data,
    options: {
      plugins: {
        legend: { display: false },
        title: { text: props.title, color: 'white', display: !!props.title },
      },
      layout: { padding: 0 },
    },
  })

  if (props.width && props.height) {
    chart.resize(props.width, props.height)
  }
}
</script>
