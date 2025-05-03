<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <h1>Statistics</h1>
  <div class="row options" style="overflow: auto">
    <button
      :id="tab"
      v-for="{ tab, text } in tabs"
      :class="{ selected: tabSelected == tab }"
      style="min-width: 140px"
      @click="
        () => {
          scrollTabButtonIntoView(tab)
          tabSelected = tab
        }
      "
    >
      {{ text }}
    </button>
  </div>
  <PersonalStatistics v-if="tabSelected == 'personal'"></PersonalStatistics>
  <TableStatistics v-if="tabSelected == 'tables'"></TableStatistics>
  <GraphStatistics v-if="tabSelected == 'graphs'"></GraphStatistics>
  <BeerStatistics v-if="tabSelected == 'beer'"></BeerStatistics>
  <AchievementStatistics
    v-if="tabSelected == 'achievements'"
  ></AchievementStatistics>
</template>

<script lang="ts" setup>
import AchievementStatistics from '@/components/AchievementStatistics.vue'
import BeerStatistics from '@/components/BeerStatistics.vue'
import GraphStatistics from '@/components/GraphStatistics.vue'
import PersonalStatistics from '@/components/PersonalStatistics.vue'
import TableStatistics from '@/components/TableStatistics.vue'
import { router } from '@/router'
import { ref } from 'vue'

const tabSelected = ref<
  'personal' | 'tables' | 'graphs' | 'beer' | 'achievements'
>('personal')

const scrollTabButtonIntoView = (tab: string) => {
  const btn = document.querySelector(`button#${tab}`)
  btn?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center',
  })
}

const tabs = [
  { tab: 'personal', text: 'Personal' },
  { tab: 'tables', text: 'Global Tables' },
  { tab: 'graphs', text: 'Global Graphs' },
  { tab: 'beer', text: 'Beer' },
  { tab: 'achievements', text: 'Achievements' },
] as const
</script>
