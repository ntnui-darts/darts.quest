<template>
  <button v-if="!userStore.user" @click="router.push({ name: 'login' })">
    Login
  </button>
  <button v-if="userStore.user" @click="router.push({ name: 'user' })">
    {{ userStore.name || userStore.user.email }}
  </button>
  <div class="row">
    <button
      v-for="t in GameTypes"
      :class="{ selected: t == gameType }"
      @click="gameType = t"
    >
      {{ t }}
    </button>
  </div>
  <!-- <button
    v-for="user in userStore.users"
    :class="{ selected: users.has(user) }"
    @click="toggleUser(user)"
  >
    {{ user.name }}
  </button>
  <button @click="userStore.addUser">+ Add user</button> -->
  <!-- <button :disabled="users.size == 0" @click="onPlay">Play</button> -->
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { GameType, GameTypes } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { ref, onMounted } from 'vue';

// const users = ref(new Set<User>());
const gameType = ref<GameType>(501);

// const gameStore = useGameStore();
const userStore = useUserStore();

// const toggleUser = (user: User) => {
//   if (users.value.has(user)) {
//     users.value.delete(user);
//   } else {
//     users.value.add(user);
//   }
// };

// const onPlay = () => {
//   if (users.value.size == 0) return;
//   gameStore.setCurrentGame({
//     id: '',
//     legs: Array.from(users.value).map((user) => ({
//       id: '',
//       userId: user.id,
//       visits: [],
//       arrows: 'unknown',
//     })),
//     type: gameType.value,
//   });
//   router.push({ name: 'game' });
// };

onMounted(async () => {
  await userStore.getUser();
  if (!userStore.user) {
    router.push({ name: 'login' });
  }
});
</script>
