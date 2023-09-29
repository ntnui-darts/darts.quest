<template>
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
    v-for="user in userStore.users"
    :class="{ selected: users.has(user) }"
    @click="toggleUser(user)"
  >
    {{ user.name }}
  </button>
  <button @click="userStore.addUser">+ Add user</button>
  <button :disabled="users.size == 0" @click="onPlay">Play</button>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { useGameStore, GameType, GameTypes } from '@/stores/gameStore';
import { useUserStore, User } from '@/stores/userStore';
import { ref } from 'vue';

const users = ref(new Set<User>());
const gameType = ref<GameType>(501);

const gameStore = useGameStore();
const userStore = useUserStore();

const toggleUser = (user: User) => {
  if (users.value.has(user)) {
    users.value.delete(user);
  } else {
    users.value.add(user);
  }
};

const onPlay = () => {
  if (users.value.size == 0) return;
  gameStore.setCurrentGame({
    legs: Array.from(users.value).map((user) => ({
      userId: user.id,
      visits: [],
      arrows: 'unknown',
    })),
    type: gameType.value,
  });
  router.push({ name: 'game' });
};
</script>
@/stores/userStore
