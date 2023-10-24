<template>
  <Chart :datasets="datasets" :show-smooth-button="showSmoothButton"></Chart>
</template>

<script lang="ts" setup>
import Chart from './Chart.vue'
import { Leg, getTypeAttribute } from '@/types/game'
import { computed } from 'vue'
import { smoothPoints } from './chart'

const props = defineProps<{
  legs: Leg[]
  y: (leg: Leg) => number
  groupByType: boolean
  showSmoothButton: boolean
}>()

const datasets = computed(() => {
  return props.groupByType
    ? getDatasetsGroupedByType()
    : [
        {
          label: `Smooth`,
          data: smoothPoints(
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
})

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
      const points = legs.map((leg) => ({
        x: new Date(leg.createdAt),
        y: props.y(leg),
      }))
      if (legs.length > 0) {
        datasets.push({
          label: `${type} ${finishTypeText}`,
          data: points,
        })
      }
    }
  }
  return datasets
}
</script>
