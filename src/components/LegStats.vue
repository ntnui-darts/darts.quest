<template>
  <div class="row spaced" style="align-items: center">
    <p>
      <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
      <br />
      <span
        >{{ leg.type }}
        {{ ['Single', 'Double', 'Triple'][leg.finishType - 1] }} finish</span
      >
      {{ leg.visits.length }} visits
    </p>
    <button @click="showChart" style="flex: 0">Chart</button>
  </div>
</template>

<script lang="ts" setup>
import { Leg } from '@/stores/game';
import DartboardChart from './DartboardChart.vue';
import { useModalStore } from '@/stores/modal';

const props = defineProps<{
  leg: Leg;
}>();

const showChart = () => {
  useModalStore().push(DartboardChart, { visits: props.leg.visits }, {});
};
</script>
