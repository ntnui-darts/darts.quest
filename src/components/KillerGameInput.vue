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
  <div
    v-if="players.some((player) => player.sector == null)"
    class="grid-sectors"
  >
    <button
      v-for="(_, i) in Array(20)"
      @click="selectSector(i + 1)"
      :disabled="players.some((player) => player.sector == i + 1)"
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
      @click="
        () => {
          emit('undo')
          updatePlayers()
        }
      "
    >
      &#x232B;
    </button>
  </div>
  <div v-else class="col">
    <div class="grid-killer">
      <button
        v-for="player in players"
        style="height: 4em"
        @click="selectSector(player.sector)"
      >
        {{ useUsersStore().getUser(player.userId)?.name }} [{{ player.sector }}]
      </button>
    </div>
    <div class="row">
      <button
        @click="selectSector(0)"
        :class="{
          selected: selectedSector == 0,
        }"
      >
        0
      </button>
      <button
        @click="
          () => {
            emit('undo')
            updatePlayers()
          }
        "
      >
        &#x232B;
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { KillerController, KillerPlayer } from '@/games/killer'
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import { Segment, multiplierToString } from '@/types/game'
import { ref, onMounted } from 'vue'

const selectedMultiplier = ref(1)
const selectedSector = ref<number | null>(null)
const gameStore = useGameStore()

const players = ref<KillerPlayer[]>([])

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
}>()

const selectSector = (sector: number | null) => {
  if (sector == null) throw Error()
  if (sector == 0) {
    emit('miss')
  } else {
    emit('hit', {
      multiplier: selectedMultiplier.value,
      sector: sector,
    })
  }
  selectedMultiplier.value = 1
  updatePlayers()
}

const updatePlayers = () => {
  players.value =
    (useGameStore().getController() as KillerController)
      .getKillerPlayers()
      .filter((player) => !gameStore.gameState?.rank.includes(player.userId)) ??
    []
}

onMounted(() => {
  updatePlayers()
})
</script>

<style scoped>
.grid-sectors {
  display: grid;
  column-gap: 0.5em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

.grid-killer {
  display: grid;
  column-gap: 1em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr;
}
</style>
