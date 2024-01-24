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
import { useGameStore } from '@/stores/game'
import {
  Multiplier,
  Segment,
  getTypeAttribute,
  multiplierToString,
} from '@/types/game'
import { ref } from 'vue'

const gameStore = useGameStore()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
}>()

const getDefaultMultiplier = () =>
  gameStore.game ? getTypeAttribute<Multiplier>(gameStore.game, 'mode', 1) : 1

const selectedMultiplier = ref(getDefaultMultiplier())

const registerMiss = () => {
  emit('miss')
  selectedMultiplier.value = 1
}

const registerHit = () => {
  if (!gameStore.game) throw Error()
  emit('hit', { multiplier: selectedMultiplier.value, sector: -1 })
  selectedMultiplier.value = getDefaultMultiplier()
}
</script>

<style scoped>
button {
  font-size: larger;
}
</style>
