<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options">
    <button
      id="back"
      :class="{ selected: tab == 'personal' }"
      @click="tab = 'personal'"
    >
      Personal
    </button>
    <button
      id="back"
      :class="{ selected: tab == 'global' }"
      @click="tab = 'global'"
    >
      Global
    </button>
  </div>
  <PersonalStatistics v-if="tab == 'personal'"></PersonalStatistics>
  <GlobalStatistics v-if="tab == 'global'"></GlobalStatistics>
</template>

<script lang="ts" setup>
import GlobalStatistics from '@/components/GlobalStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tab = ref<'global' | 'personal'>('personal')
</script>
