<template>
  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'stats' })">My Stats</button>
  </div>
  <br />
  <h2>Select Game Type</h2>
  <div class="row">
    <button
      v-for="(_, k) in GameTypes"
      :class="{ selected: k == gameType }"
      @click="gameType = k"
    >
      {{ k }}
    </button>
  </div>
  <h4 style="margin: 0">{{ gameType == 'Round the Clock' ? 'Mode' : 'Finish' }}</h4>
  <div class="row">
    <button
      v-for="t in ([1, 2, 3] as const)"
      :class="{ selected: t == finishType }"
      @click="finishType = t"
    >
      {{ ['Single', 'Double', 'Triple'][t - 1] }}
    </button>
  </div>
  <h2>Select Players</h2>
  <div v-auto-animate class="col">
    <button
      v-for="user in usersStore.users"
      :key="user.id"
      :id="user.id"
      :class="{ selected: selectedUsers.has(user.id) }"
      @click="toggleUser(user)"
    >
      {{ user.name }}
    </button>
  </div>
  <br />
  <br />
  <button :disabled="selectedUsers.size == 0" @click="onPlay">Play</button>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { GameType, GameTypes, Leg } from '@/stores/game';
import { useGameStoreX01 } from '@/stores/game-x01';
import { useGameStoreRoundDaClock } from '@/stores/game-round-da-clock';
import { useUsersStore, User } from '@/stores/users';
import { nanoid } from 'nanoid';
import { ref, watch } from 'vue';

const gameStoreX01 = useGameStoreX01();
const gameStoreRoundDaClock = useGameStoreRoundDaClock();
const usersStore = useUsersStore();

const selectedUsers = ref(new Set<string>());
const gameType = ref<GameType>('301');
const finishType = ref<1 | 2 | 3>(2);

watch(
  () => usersStore.getCurrentUser,
  (user) => {
    if (user) {
      selectedUsers.value.add(user.id);
    }
  },
  { immediate: true }
);

const toggleUser = (user: User) => {
  if (selectedUsers.value.has(user.id)) {
    selectedUsers.value.delete(user.id);
  } else {
    selectedUsers.value.add(user.id);
  }
};

const onPlay = () => {
  if (selectedUsers.value.size == 0) return;
  if (!usersStore.getCurrentUser) return;
  const gameId = nanoid();
  const players = Array.from(selectedUsers.value);
  const store = gameType.value == 'Round the Clock' ? gameStoreRoundDaClock : gameStoreX01
  store.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    type: gameType.value,
    finishType: finishType.value,
    result: [],
    players,
    legs: players.map(
      (userId) =>
        ({
          id: nanoid(),
          userId,
          visits: [],
          arrows: 'unknown',
          confirmed: false,
          gameId: gameId,
          type: gameType.value,
          finishType: finishType.value,
          beers: null,
          finish: false,
          createdAt: new Date().toISOString(),
        } satisfies Leg)
    ),
  });
  router.push(gameType.value == 'Round the Clock' ? { name: 'game-round-da-clock' } : { name: 'game-x01' } );
};
</script>
@/stores/game-x01