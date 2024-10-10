<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options">
    <button :class="{ selected: tab == 'personal' }" @click="tab = 'personal'">
      Personal
    </button>
    <button :class="{ selected: tab == 'global' }" @click="tab = 'global'">
      Global Tables
    </button>
    <button :class="{ selected: tab == 'history' }" @click="tab = 'history'">
      Global Graphs
    </button>
    <button :class="{ selected: tab == 'beer' }" @click="tab = 'beer'">
      Beer
    </button>
  </div>
  <PersonalStatistics v-if="tab == 'personal'"></PersonalStatistics>
  <GlobalStatistics v-if="tab == 'global'"></GlobalStatistics>
  <HistoryStatistics v-if="tab == 'history'"></HistoryStatistics>
  <BeerStatistics v-if="tab == 'beer'"></BeerStatistics>
</template>

<script lang="ts" setup>
import BeerStatistics from '@/components/BeerStatistics.vue'
import GlobalStatistics from '@/components/GlobalStatistics.vue'
import HistoryStatistics from '@/components/HistoryStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tab = ref<'global' | 'personal' | 'history' | 'beer'>('personal')
</script>
