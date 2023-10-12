<template>
  <canvas ref="chartElement"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js'
import { Visit } from '@/types/game'

const props = defineProps<{
  visits: Visit[]
  width?: number
  height?: number
  statType: 'x01' | 'rtc'
  title?: string
}>()

const chartElement = ref<HTMLCanvasElement | null>(null)
const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
]
let chart: Chart<any> | null = null

onMounted(() => {
  buildChart()
})
const x01Stats = () =>
  numbers.map((n) => props.visits.flat().filter((s) => s?.sector == n).length)

const rtcStats = () => {
  const visitsFlat = props.visits.flat()
  let count = 0
  const missCountList = Array(20).fill(0)
  const hitCountList = Array(20).fill(0)
  for (let i = 0; i < visitsFlat.length; i++) {
    const visit = visitsFlat[i]
    if (!visit) {
      continue
    }
    if (visit.sector == 0) {
      count++
    } else {
      const index = numbers.indexOf(visit.sector)
      missCountList[index] += count
      hitCountList[index] += 1
      count = 0
    }
  }
  return Array(20)
    .fill(0)
    .map((_, i) => hitCountList[i] / (hitCountList[i] + missCountList[i]))
}

watch(
  () => props.visits,
  () => buildChart()
)
const getData = () => {
  switch (props.statType) {
    case 'rtc':
      return rtcStats()
    case 'x01':
      return x01Stats()
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
  chart?.destroy()
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
  chartElement.value.style.transform = 'rotate(-9deg)'
  if (props.width && props.height) {
    chart.resize(props.width, props.height)
  }
}
</script>
