<template>
  <div class="row" style="justify-content: space-between">
    <button
      v-for="i in [1, 2, 3]"
      @click="selectedMultiplier = i"
      :disabled="i == 3 && selectedSector == 25"
      :class="{
        selected: selectedMultiplier == i,
      }"
    >
      {{ multiplierToString(i) }}
    </button>
  </div>
  <div class="grid-sectors">
    <button
      v-for="(_, i) in Array(20)"
      @click="selectSector(i + 1)"
      :class="{
        selected: selectedSector == i + 1,
      }"
    >
      {{ i + 1 }}
    </button>
    <button
      @click="selectSector(0)"
      :class="{
        selected: selectedSector == 0,
      }"
    >
      0
    </button>
    <button
      :disabled="selectedMultiplier == 3"
      @click="selectSector(25)"
      :class="{
        selected: selectedSector == 25,
      }"
    >
      25
    </button>
    <button @click="emit('undo')">&#x232B;</button>
  </div>
</template>

<script lang="ts" setup>
import {
  Game,
  GameController,
  GameState,
  Segment,
  multiplierToString,
} from '@/types/game'
import { ref } from 'vue'

const selectedMultiplier = ref(1)
const selectedSector = ref<number | null>(null)

defineProps<{
  game: Game
  gameState: GameState
  gameController: GameController<GameState>
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
}>()

const selectSector = (sector: number) => {
  if (sector == 0) {
    emit('miss')
  } else {
    emit('hit', {
      multiplier: selectedMultiplier.value,
      sector: sector,
    })
  }
  selectedMultiplier.value = 1
}
</script>

<style scoped>
.grid-sectors {
  display: grid;
  column-gap: 0.5em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}
</style>
