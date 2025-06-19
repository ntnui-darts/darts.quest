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
  <div class="row" style="overflow: auto">
    <div
      v-for="player in gameState.players"
      class="col"
      style="flex: 1; min-width: 30%"
    >
      <div style="text-align: center">
        {{ stringMaxLength(useUsersStore().getName(player.id), 10) }}
      </div>
      <button
        v-for="(_, i) in Array(6)"
        @click="selectSector(20 - i)"
        :class="{
          selected: selectedSector == 20 - i,
        }"
        :disabled="
          player != currentPlayer ||
          (gameState.unlocks.get(20 - i) ?? 0) == gameState.players.length
        "
      >
        {{ player == currentPlayer ? 20 - i : '&#8203;' }}
        {{ multiplierToString(Math.min(player?.hits.get(20 - i) ?? 0, 3)) }}
      </button>
      <button
        @click="selectSector(25)"
        :class="{
          selected: selectedSector == 25,
        }"
        :disabled="
          player != currentPlayer ||
          selectedMultiplier == 3 ||
          (gameState.unlocks.get(25) ?? 0) == gameState.players.length
        "
      >
        {{ player == currentPlayer ? 'Bull' : '&#8203;' }}
        {{ multiplierToString(Math.min(player?.hits.get(25) ?? 0, 3)) }}
      </button>
      <button
        @click="selectSector(0)"
        :class="{
          selected: selectedSector == 0,
        }"
        :disabled="player != currentPlayer"
      >
        {{ player == currentPlayer ? 0 : '&#8203;' }}
      </button>
      <button v-if="player == currentPlayer" @click="emit('undo')">
        &#x232B;
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { stringMaxLength } from '@/functions/string'
import { CricketGameState } from '@/games/cricket'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameState,
  Segment,
  multiplierToString,
} from '@/types/game'
import { computed, ref } from 'vue'

const props = defineProps<{
  game: Game
  gameState: CricketGameState
  gameController: GameController<GameState>
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
  resign: []
}>()

const selectedMultiplier = ref(1)
const selectedSector = ref<number | null>(null)
const currentPlayer = computed(() =>
  props.gameState.players.find((p) => p.id == props.gameState.player)
)

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
