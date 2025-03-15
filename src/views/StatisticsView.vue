<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options">
    <button :class="{ selected: tab == 'personal' }" @click="tab = 'personal'">
      Personal
    </button>
    <button :class="{ selected: tab == 'tables' }" @click="tab = 'tables'">
      Global Tables
    </button>
    <button :class="{ selected: tab == 'graphs' }" @click="tab = 'graphs'">
      Global Graphs
    </button>
    <button :class="{ selected: tab == 'beer' }" @click="tab = 'beer'">
      Beer
    </button>
  </div>
  <PersonalStatistics v-if="tab == 'personal'"></PersonalStatistics>
  <TableStatistics v-if="tab == 'tables'"></TableStatistics>
  <GraphStatistics v-if="tab == 'graphs'"></GraphStatistics>
  <BeerStatistics v-if="tab == 'beer'"></BeerStatistics>
</template>

<script lang="ts" setup>
import BeerStatistics from '@/components/BeerStatistics.vue'
import GraphStatistics from '@/components/GraphStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import TableStatistics from '@/components/TableStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tab = ref<'personal' | 'tables' | 'graphs' | 'beer'>('personal')
</script>
