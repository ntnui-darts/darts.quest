<template>
  <modal-view></modal-view>
  <div class="view-container col">
    <router-view></router-view>
  </div>
  <div v-if="loadingStore.loading" class="loading"></div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ModalView from './components/ModalView.vue'
import { useLoadingStore } from './stores/loading'

const loadingStore = useLoadingStore()
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
