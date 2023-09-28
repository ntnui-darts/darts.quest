<template>
  <div class="view col">
    <div class="row">
      <button
        v-for="t in GameTypes"
        :class="{ selected: t == gameType }"
        @click="gameType = t"
      >
        {{ t }}
      </button>
    </div>
    <button
      v-for="player in playerStore.players"
      :class="{ selected: players.has(player) }"
      @click="togglePlayer(player)"
    >
      {{ player.name }}
    </button>
    <button @click="playerStore.addPlayer">+ Add Player</button>
    <button :disabled="players.size == 0" @click="onPlay">Play</button>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { useGameStore, GameType, GameTypes } from '@/stores/gameStore';
import { usePlayerStore, Player } from '@/stores/playerStore';
import { ref } from 'vue';

const players = ref(new Set<Player>());
const gameType = ref<GameType>(501);

const gameStore = useGameStore();
const playerStore = usePlayerStore();

const togglePlayer = (player: Player) => {
  if (players.value.has(player)) {
    players.value.delete(player);
  } else {
    players.value.add(player);
  }
};

const onPlay = () => {
  if (players.value.size == 0) return;
  gameStore.setCurrentGame({
    legs: Array.from(players.value).map((player) => ({
      playerId: player.id,
      visits: [],
      arrows: 'unknown',
    })),
    type: gameType.value,
  });
  router.push({ name: 'game' });
};
</script>
