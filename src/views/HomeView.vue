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
      v-for="t in GameTypes"
      :class="{ selected: t == gameType }"
      @click="gameType = t"
    >
      {{ t }}
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
import { GameType, GameTypes, useGameStore } from '@/stores/game';
import { useUsersStore, User } from '@/stores/users';
import { ref } from 'vue';

const gameStore = useGameStore();
const usersStore = useUsersStore();

const selectedUsers = ref(new Set<User>());
const gameType = ref<GameType>(301);

const toggleUser = (user: User) => {
  if (selectedUsers.value.has(user)) {
    selectedUsers.value.delete(user);
  } else {
    selectedUsers.value.add(user);
  }
};

const onPlay = () => {
  if (selectedUsers.value.size == 0) return;
  gameStore.setCurrentGame({
    id: '',
    legs: Array.from(selectedUsers.value).map((user) => ({
      id: '',
      userId: user.id,
      visits: [],
      arrows: 'unknown',
    })),
    type: gameType.value,
    result: [],
  });
  router.push({ name: 'game' });
};
</script>
