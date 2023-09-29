<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <p>{{ authStore.getName }}</p>
  <p>{{ authStore.user?.email }}</p>
  <button id="logout" @click="logout">Logout</button>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router';

const authStore = useAuthStore();

const logout = async () => {
  await authStore.signOut();
  router.push({ name: 'login' });
};
</script>
