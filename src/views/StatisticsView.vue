<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options">
    <button :class="{ selected: tab == 'personal' }" @click="tab = 'personal'">
      Personal
    </button>
    <button :class="{ selected: tab == 'global' }" @click="tab = 'global'">
      Global
    </button>
    <button :class="{ selected: tab == 'history' }" @click="tab = 'history'">
      Global History [Experimental]
    </button>
  </div>
  <PersonalStatistics v-if="tab == 'personal'"></PersonalStatistics>
  <GlobalStatistics v-if="tab == 'global'"></GlobalStatistics>
  <HistoryStatistics v-if="tab == 'history'"></HistoryStatistics>
</template>

<script lang="ts" setup>
import GlobalStatistics from '@/components/GlobalStatistics.vue'
import HistoryStatistics from '@/components/HistoryStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tab = ref<'global' | 'personal' | 'history'>('personal')
</script>
