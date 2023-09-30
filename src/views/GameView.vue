<template>
  <button @click="quit">Quit</button>
  <div v-if="gameStore.currentGame && !allPlayersFinished" class="col">
    <div class="grid-users" style="grid-template-columns: 1fr 1fr">
      <button
        v-for="userId in gameStore.getUserIds.filter(
          (id) => !gameStore.currentGame?.result.includes(id)
        )"
        :class="{ selected: gameStore.currentUserId == userId }"
      >
        {{ usersStore.getUser(userId)?.name ?? 'Unknown' }}
        <br />
        {{
          (gameStore.currentGame.type ?? 0) -
          getLegScore(
            gameStore.getUserLeg(userId),
            gameStore.currentGame.type,
            gameStore.currentGame.finishType
          )
        }}
        ({{
          getAvgLegScore(
            gameStore.getUserLeg(userId),
            gameStore.currentGame.type,
            gameStore.currentGame.finishType
          ).toFixed(1)
        }})
      </button>
    </div>
    <div class="row">
      <button
        v-for="(segment, i) in gameStore.getCurrentVisit"
        :class="{ outlined: i == gameStore.getNumberOfThrows }"
      >
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
      <button @click="gameStore.undoScore">❌</button>
    </div>
  </div>
  <div v-if="gameStore.currentGame && somePlayersFinished">
    <h2>Results, {{ gameStore.currentGame.type }}</h2>
    <ol>
      <li v-for="id in gameStore.currentGame.result">
        {{ usersStore.getUser(id)?.name ?? 'Unknown' }},
        {{
          gameStore.currentGame.legs.find((leg) => leg.userId == id)?.visits
            .length
        }}
        turns,
        {{
          getAvgLegScore(
            gameStore.currentGame.legs.find((leg) => leg.userId == id) ?? null,
            gameStore.currentGame.type,
            gameStore.currentGame.finishType,
            true
          ).toFixed(1)
        }}
        average.
      </li>
    </ol>
    <div class="col">
      <button @click="saveGame">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import {
  useGameStore,
  multiplierToString,
  getLegScore,
  getAvgLegScore,
} from '../stores/game';
import { router } from '@/router';
import { useUsersStore } from '@/stores/users';

const gameStore = useGameStore();
const usersStore = useUsersStore();

const selectedMultiplier = ref(1);
const selectedSector = ref<number | null>(null);

const allPlayersFinished = computed(
  () =>
    (gameStore.currentGame?.legs.length ?? 0) ==
    (gameStore.currentGame?.result.length ?? 0)
);

const somePlayersFinished = computed(
  () => (gameStore.currentGame?.result.length ?? 0) > 0
);

onMounted(() => {
  if (!gameStore.currentGame) {
    quit();
  }
});

const quit = () => {
  router.push('/');
};

const selectSector = (sector: number) => {
  selectedSector.value = sector;
  submitScore();
};

const submitScore = () => {
  if (selectedSector.value == null) return;
  gameStore.saveScore({
    multiplier: selectedMultiplier.value,
    sector: selectedSector.value,
  });
  selectedMultiplier.value = 1;
  selectedSector.value = null;
};

const saveGame = async () => {
  await gameStore.saveGame();
  quit();
};
</script>

<style scoped>
.grid-users {
  display: grid;
  column-gap: 1em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr;
}

.grid-sectors {
  display: grid;
  column-gap: 0.5em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

button {
  flex: 1;
}

.outlined {
  outline: 1px solid var(--c-green);
}

li {
  font-size: 14pt;
  padding-bottom: 0.5em;
}
</style>
