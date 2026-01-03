<template>
  <template v-if="!showForcedCompletion">
    <div
      v-if="getTypeAttributeOrDefault(game, 'fast')"
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
      <button @click="registerMiss">&#10008;</button>
      <button @click="registerHit">&#10004;</button>
    </div>
    <button @click="emit('undo')">&#x232B;</button>

    <button @click="emit('resign')">Resign</button>
  </template>

  <template v-if="showForcedCompletion">
    <ForcedCompletion
      :game="game"
      :game-state="gameState"
      @undo="emit('undo')"
    ></ForcedCompletion>
  </template>
</template>

<script lang="ts" setup>
import {
  Game,
  GameController,
  GameState,
  Segment,
  multiplierToString,
} from '@/types/game'
import {
  getTypeAttributeOrDefault,
  hasReachedMaxVisits,
} from '@/types/typeAttributes'
import { computed, ref } from 'vue'
import ForcedCompletion from './ForcedCompletion.vue'

const props = defineProps<{
  game: Game
  gameState: GameState
  gameController: GameController<GameState>
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
  resign: []
}>()

const showForcedCompletion = computed(() =>
  hasReachedMaxVisits(props.game, props.gameState)
)

const getDefaultMultiplier = () => getTypeAttributeOrDefault(props.game, 'mode')

const selectedMultiplier = ref(getDefaultMultiplier())

const registerMiss = () => {
  emit('miss')
  selectedMultiplier.value = 1
}

const registerHit = () => {
  emit('hit', { multiplier: selectedMultiplier.value, sector: -1 })
  selectedMultiplier.value = getDefaultMultiplier()
}
</script>

<style scoped>
button {
  font-size: larger;
}
</style>
