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
      v-for="(_, i) in Array(6)"
      @click="selectSector(i + 15)"
      :class="{
        selected: selectedSector == i + 15,
      }"
      :disabled="(gameState.unlocks.get(i + 15) ?? 0) > 1"
    >
      {{ i + 15 }}
      {{ multiplierToString(Math.min(player?.hits.get(i + 15) ?? 0, 3)) }}
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
      @click="selectSector(25)"
      :class="{
        selected: selectedSector == 25,
      }"
      :disabled="
        selectedMultiplier == 3 || (gameState.unlocks.get(25) ?? 0) > 1
      "
    >
      25
      {{ multiplierToString(Math.min(player?.hits.get(25) ?? 0, 3)) }}
    </button>
    <button @click="emit('undo')">&#x232B;</button>
  </div>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/stores/game'
import { Segment, multiplierToString } from '@/types/game'
import { ref, computed } from 'vue'
import { CricketGameState } from '@/games/cricket'

const selectedMultiplier = ref(1)
const selectedSector = ref<number | null>(null)
const gameState = computed(() => useGameStore().gameState as CricketGameState)
const player = computed(() =>
  gameState.value.players.find((p) => p.id == gameState.value.player)
)

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
  column-gap: 1em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr;
}
.grid-sectors button {
  height: 4em;
}
</style>
