<template>
  <div v-auto-animate class="view-container col">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useUsersStore } from './stores/users';
import { useAuthStore } from './stores/auth';
import { router } from './router';

const usersStore = useUsersStore();
const authStore = useAuthStore();

onMounted(async () => {
  await usersStore.fetchUsers();
  if (!authStore.auth) {
    router.push({ name: 'login' });
  }
});

onMounted(async () => {});
</script>

<style scoped>
.view-container {
  margin: auto;
  max-width: 600px;
  padding: 1em;
}
</style>
