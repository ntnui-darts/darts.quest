<template>
  <canvas ref="chartElement"></canvas>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted } from 'vue'
import { Chart } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Leg, getTypeAttribute } from '@/types/game'

const props = defineProps<{
  legs: Leg[]
  y: (leg: Leg) => number
  groupByType: boolean
}>()

const chartElement = ref<HTMLCanvasElement | null>(null)
let chart: Chart<any> | null = null

const legsOfType = (startScore: 301 | 501 | 701, finishType: 1 | 2 | 3) => {
  return props.legs.filter(
    (leg) =>
      leg.finish &&
      getTypeAttribute<number>(leg, 'startScore', NaN) == startScore &&
      leg.typeAttributes.includes(`finish:${finishType}`)
  )
}

const getDatasetsGroupedByType = () => {
  const datasets = []
  for (const type of [301, 501, 701] as const) {
    for (const [finishType, finishTypeText] of [
      [1, 'Single'],
      [2, 'Double'],
      [3, 'Triple'],
    ] as const) {
      const legs = legsOfType(type, finishType)
      if (legs.length > 0) {
        datasets.push({
          label: `${type} ${finishTypeText}`,
          data: legs.map((leg) => ({
            x: new Date(leg.createdAt),
            y: props.y(leg),
          })),
        })
      }
    }
  }
  return datasets
}

const buildChart = async () => {
  if (!chartElement.value || props.legs.length == 0) return

  const datasets = props.groupByType
    ? getDatasetsGroupedByType()
    : [
        {
          label: `All`,
          data: props.legs.map((leg) => ({
            x: new Date(leg.createdAt),
            y: props.y(leg),
          })),
        },
      ]
  console.log(datasets)
  chart?.destroy()
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
  })
}

onMounted(() => {
  buildChart()
})

watch(
  () => props.legs,
  () => buildChart()
)
</script>
