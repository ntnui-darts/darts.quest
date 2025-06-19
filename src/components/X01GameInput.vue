<template>
  <template v-if="!forcedCompletion">
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
  Segment,
  getTypeAttribute,
  multiplierToString,
} from '@/types/game'
import { computed, ref } from 'vue'
import ForcedCompletion from './ForcedCompletion.vue'

const selectedMultiplier = ref(1)
const selectedSector = ref<number | null>(null)

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
