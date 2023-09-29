<template>
  <button @click="router.push({ name: 'home' })">Back</button>
  <p>{{ userStore.name }}</p>
  <p>{{ userStore.user?.email }}</p>
  <button @click="logout">Logout</button>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/userStore';
import { router } from '@/router';

const userStore = useUserStore();

const logout = async () => {
  await userStore.signOut();
  router.push({ name: 'login' });
};
</script>
