<template>
  <div class="row spaced" style="align-items: center">
    <p>
      <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
      <br />
      <span>
        <!-- TODO: Use controller -->
        {{ leg.type }}
        {{
          ['Single', 'Double', 'Triple'][getTypeAttribute<number>(leg, 'finish', 1)]
        }}
        finish</span
      >
      {{ leg.visits.length }} visits
    </p>
    <button @click="showChart" style="flex: 0">Chart</button>
  </div>
</template>

<script lang="ts" setup>
import DartboardChart from './DartboardChart.vue'
import { Leg, getTypeAttribute } from '@/types/game'
import { useModalStore } from '@/stores/modal'

const props = defineProps<{
  leg: Leg
}>()

const showChart = () => {
  useModalStore().push(DartboardChart, { visits: props.leg.visits }, {})
}
</script>
