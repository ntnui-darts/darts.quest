<template>
  <div>
    <h2>{{ user.name }}</h2>
    <p v-for="line in info">{{ line }}</p>
    <DartboardChart :visits="leg.visits" :stat-type="leg.type"></DartboardChart>
  </div>
</template>

<script lang="ts" setup>
import { getRtcHitRate } from '@/games/rtc'
import { getAvgVisitScore, getFirst9Avg } from '@/games/x01'
import { roundToNDecimals, toPercentage } from '@/stores/stats'
import { User } from '@/stores/users'
import { Leg } from '@/types/game'
import { computed } from 'vue'
import DartboardChart from './DartboardChart.vue'

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
