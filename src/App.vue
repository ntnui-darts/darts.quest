<template>
  <div v-auto-animate class="view-container col">
    <router-view></router-view>
  </div>
  <div v-if="loadingStore.loading" class="loading"></div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useLoadingStore } from './stores/loading';
import { router } from './router';

const authStore = useAuthStore();
const loadingStore = useLoadingStore();

onMounted(async () => {
  await useAuthStore().getSession();
  if (!authStore.auth) {
    router.push({ name: 'login' });
  }
});
</script>

<style scoped>
.view-container {
  margin: auto;
  max-width: 600px;
  padding: 1em;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #24242460;
}
</style>
