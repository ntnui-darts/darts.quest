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
      getTypeAttribute<number>(leg, 'startScore', 0) == startScore &&
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

type Point = { x: Date; y: number }

const smooth = (points: Point[]) => {
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
      y += b.y * weight
      console.log(weight)
    }
    smoothed.push({ x: a.x, y: y / sumWeights })
  }
  return smoothed
}

const buildChart = async () => {
  if (!chartElement.value || props.legs.length == 0) return

  const datasets = props.groupByType
    ? getDatasetsGroupedByType()
    : [
        {
          label: `Smooth`,
          data: smooth(
            props.legs.map((leg) => ({
              x: new Date(leg.createdAt),
              y: props.y(leg),
            }))
          ),
          borderColor: 'rgb(19, 221, 97)',
        },
        {
          label: `All`,
          data: props.legs.map((leg) => ({
            x: new Date(leg.createdAt),
            y: props.y(leg),
          })),
          borderColor: '#555555',
        },
      ]

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
