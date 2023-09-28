<template>
  <div class="view col">
    <div class="row">
      <p>Game: {{ playerStore.currentMax }}</p>
    </div>
    <div class="row">
      <button
        v-for="player in playerStore.players"
        :class="{ selected: playerStore.currentPlayer == player }"
      >
        {{ player.name }}
        <br />
        {{
          playerStore.currentMax - getLegScore(player, playerStore.currentMax)
        }}
        (avg {{ getAvgLegScore(player, playerStore.currentMax) }})
      </button>
      <button @click="playerStore.addPlayer">+ Add Player</button>
    </div>
    <div class="row">
      <button v-for="segment in playerStore.getCurrentVisit">
        {{ multiplierToString(segment?.multiplier) }} - {{ segment?.sector }}
      </button>
    </div>
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
    <div class="grid">
      <button
        v-for="(_, i) in Array(20)"
        @click="selectedSector = i + 1"
        :class="{
          selected: selectedSector == i + 1,
        }"
      >
        {{ i + 1 }}
      </button>
      <button
        @click="selectedSector = 0"
        :class="{
          selected: selectedSector == 0,
        }"
      >
        0
      </button>
      <button
        :disabled="selectedMultiplier == 3"
        @click="selectedSector = 25"
        :class="{
          selected: selectedSector == 25,
        }"
      >
        25
      </button>
      <button @click="playerStore.undoScore">❌</button>
      <button @click="submitScore">✔️</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  usePlayerStore,
  multiplierToString,
  getLegScore,
  getAvgLegScore,
} from '../stores/playerStore';

const playerStore = usePlayerStore();

const selectedMultiplier = ref(1);
const selectedSector = ref<number | null>(null);

const submitScore = () => {
  if (selectedSector.value == null) return;
  playerStore.saveScore({
    multiplier: selectedMultiplier.value,
    sector: selectedSector.value,
  });
  selectedMultiplier.value = 1;
  selectedSector.value = null;
};
</script>

<style scoped>
.view {
  margin: auto;
  max-width: 600px;
  font-size: 1em;
}

.grid {
  display: grid;
  column-gap: 1em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

button {
  flex: 1;
}

button:disabled {
  background-color: rgb(60, 60, 60);
  color: #999999;
}

button.selected {
  background-color: rgb(19, 221, 97);
  color: black;
}
</style>
