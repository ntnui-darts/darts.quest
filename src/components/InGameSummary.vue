<template>
  <div>
    <h2>{{ user.name }}</h2>
    <p v-for="line in info">{{ line }}</p>
    <DartboardChart :visits="leg.visits" :stat-type="leg.type"></DartboardChart>
  </div>
</template>

<script lang="ts" setup>
import DartboardChart from './DartboardChart.vue'
import { Leg } from '@/types/game'
import { User } from '@/stores/users'
import { computed } from 'vue'
import { getFirst9Avg, getAvgVisitScore } from '@/games/x01'
import { getRtcHitRate } from '@/games/rtc'
import { roundToNDecimals, toPercentage } from '@/stores/stats'

const props = defineProps<{ leg: Leg; user: User }>()

const info = computed(() => {
  switch (props.leg.type) {
    case 'x01':
      return [
        `Visits: ${props.leg.visits.length}`,
        `Average: ${roundToNDecimals(
          getAvgVisitScore(props.leg.visits, props.leg),
          2
        )}`,
        `First 9 average: ${roundToNDecimals(
          getFirst9Avg(props.leg.visits, props.leg),
          2
        )}`,
      ]
    case 'rtc':
      return [
        `Visits: ${props.leg.visits.length}`,
        `Hit rate: ${toPercentage(getRtcHitRate(props.leg.visits))}`,
      ]
    case 'killer':
      return [`Visits: ${props.leg.visits.length}`]
  }
})
</script>
