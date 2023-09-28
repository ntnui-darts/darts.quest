<template>
  <div class="view-container">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 600px;
  margin-bottom: 400px;
  padding: 1em;
}
</style>
