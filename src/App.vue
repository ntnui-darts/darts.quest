<template>
  <div class="view-container col">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>
.view-container {
  margin: auto;
  max-width: 600px;
  padding: 1em;
}
</style>
