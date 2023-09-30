<template>
  <button
    v-if="usersStore.getCurrentUser"
    @click="router.push({ name: 'user' })"
  >
    My Profile
  </button>
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
  <h4 style="margin: 0">Finish</h4>
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
      :class="{ selected: selectedUsers.has(user) }"
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
import { GameType, GameTypes, useGameStore, Leg } from '@/stores/game';
import { useUsersStore, User } from '@/stores/users';
import { nanoid } from 'nanoid';
import { ref } from 'vue';

const gameStore = useGameStore();
const usersStore = useUsersStore();

const selectedUsers = ref(new Set<User>());
const gameType = ref<GameType>('301');
const finishType = ref<1 | 2 | 3>(2);

const toggleUser = (user: User) => {
  if (selectedUsers.value.has(user)) {
    selectedUsers.value.delete(user);
  } else {
    selectedUsers.value.add(user);
  }
};

const onPlay = () => {
  if (selectedUsers.value.size == 0) return;
  if (!usersStore.getCurrentUser) return;
  const gameId = nanoid();
  const players = Array.from(selectedUsers.value);
  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    type: gameType.value,
    finishType: finishType.value,
    result: [],
    players: players.map((player) => player.id),
    legs: players.map(
      (user) =>
        ({
          id: nanoid(),
          userId: user.id,
          visits: [],
          arrows: 'unknown',
          confirmed: false,
          gameId: gameId,
          type: gameType.value,
          finishType: finishType.value,
          beers: null,
          finish: false,
        } satisfies Leg)
    ),
  });
  router.push({ name: 'game' });
};
</script>
