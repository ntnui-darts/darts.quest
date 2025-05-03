<template>
  <h2>Achievements</h2>
  <div class="col">
    <div
      v-for="achievement in achievementStore.achievementsWithProgression"
      class="row"
      style="
        background-color: #1a1a1a;
        border-radius: 8px;
        padding: 0.4em 0.6em;
        justify-content: space-between;
      "
    >
      <div class="col" style="gap: 0.5em">
        <span style="font-size: large; font-weight: bold">{{
          achievement.name
        }}</span>
        <span>{{ achievement.description }}</span>
        <span v-if="achievement.achievedAt"
          >Achieved {{ new Date(achievement.achievedAt).toDateString() }}</span
        >
      </div>
      <svg
        v-if="achievement.achievedAt"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="var(--c-green)"
        width="60px"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAchievementStore } from '@/stores/achievement'
import { onMounted } from 'vue'

const achievementStore = useAchievementStore()

onMounted(() => {
  achievementStore.fetchAll()
})
</script>
