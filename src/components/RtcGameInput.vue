<template>
  <template v-if="!forcedCompletion">
    <div
      v-if="game ? getTypeAttribute < Boolean > (game, 'fast', false) : false"
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

  <template v-if="forcedCompletion">
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
  Multiplier,
  Segment,
  getTypeAttribute,
  multiplierToString,
} from '@/types/game'
import { computed, ref } from 'vue'

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

const maxVisits = getTypeAttribute<number | null>(props.game, 'maxVisits', null)

const forcedCompletion = computed(() => {
  if (maxVisits === null) return false

  const lastPlayerId = props.gameState.playersLeft.at(-1)
  if (lastPlayerId == null) return false

  const lastPlayerLeg = props.game.legs.find(
    (leg) => leg.userId == lastPlayerId
  )
  const lastPlayerVisits = lastPlayerLeg?.visits ?? []

  return (
    lastPlayerVisits.length >= maxVisits &&
    !lastPlayerVisits.at(-1)?.some((s) => s == null)
  )
})

const getDefaultMultiplier = () =>
  props.game ? getTypeAttribute<Multiplier>(props.game, 'mode', 1) : 1

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
