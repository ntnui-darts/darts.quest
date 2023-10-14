<template>
  <div class="row spaced" style="align-items: center">
    <p>
      <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
      <br />
      <span style="display: inline-block; min-width: 10em"
        >{{ getGameDisplayName(leg) }} &emsp;</span
      >
      <span>{{ leg.visits.length }} visits</span>
    </p>
    <button @click="showChart" style="flex: 0">Chart</button>
  </div>
</template>

<script lang="ts" setup>
import DartboardChart from './DartboardChart.vue'
import { Leg } from '@/types/game'
import { useModalStore } from '@/stores/modal'
import { getGameDisplayName } from '@/games/games'

const props = defineProps<{
  leg: Leg
}>()

const showChart = () => {
  useModalStore().push(
    DartboardChart,
    { visits: props.leg.visits, statType: props.leg.type },
    {}
  )
}
</script>
