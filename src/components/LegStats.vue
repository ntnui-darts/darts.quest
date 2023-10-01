<template>
  <p>
    <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
    <br />
    <span
      >{{ leg.type }}
      {{ ['Single', 'Double', 'Triple'][leg.finishType - 1] }} finish</span
    >
    {{ leg.visits.length }} visits
  </p>
  <DartboardChart :visits="leg.visits"></DartboardChart>
</template>

<script lang="ts" setup>
import { Leg } from '@/stores/game';
import DartboardChart from './DartboardChart.vue';

defineProps<{
  leg: Leg;
}>();
</script>
