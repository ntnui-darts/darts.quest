<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options">
    <button
      v-for="{ tab, text } in tabs"
      :class="{ selected: tabSelected == tab }"
      @click="tabSelected = tab"
    >
      {{ text }}
    </button>
  </div>
  <PersonalStatistics v-if="tabSelected == 'personal'"></PersonalStatistics>
  <TableStatistics v-if="tabSelected == 'tables'"></TableStatistics>
  <GraphStatistics v-if="tabSelected == 'graphs'"></GraphStatistics>
  <BeerStatistics v-if="tabSelected == 'beer'"></BeerStatistics>
</template>

<script lang="ts" setup>
import BeerStatistics from '@/components/BeerStatistics.vue'
import GraphStatistics from '@/components/GraphStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import TableStatistics from '@/components/TableStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tabSelected = ref<'personal' | 'tables' | 'graphs' | 'beer'>('personal')

const tabs = [
  { tab: 'personal', text: 'Personal' },
  { tab: 'tables', text: 'Global Tables' },
  { tab: 'graphs', text: 'Global Graphs' },
  { tab: 'beer', text: 'Beer' },
] as const
</script>
