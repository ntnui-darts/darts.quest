<template>
  <div
    v-if="
      gameStore.game
        ? getTypeAttribute < Boolean > (gameStore.game, 'fast', false)
        : false
    "
    div
    class="row"
    style="justify-content: space-between"
  >
    <button
      v-for="i in [1, 2, 3]"
      @click="selectedMultiplier = i"
      :class="{
        selected: selectedMultiplier == i,
      }"
    >
      {{ multiplierToString(i) }}
    </button>
  </div>
  <div class="row" style="height: 12em">
    <button @click="registerMiss()">&#10008;</button>
    <button @click="registerHit()">&#10004;</button>
  </div>
  <button @click="emit('undo')">&#x232B;</button>
</template>

<script lang="ts" setup>
import { Segment, multiplierToString } from '@/types/game'
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { getTypeAttribute } from '@/types/game'

const gameStore = useGameStore()

const selectedMultiplier = ref(1)

const registerMiss = () => {
  emit('miss')
  selectedMultiplier.value = 1
}

const registerHit = () => {
  emit('hit', {
    multiplier: selectedMultiplier.value,
    sector: -1, //probably bad
  })
  selectedMultiplier.value = 1
}

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
}>()
</script>

<style scoped>
button {
  font-size: larger;
}
</style>
