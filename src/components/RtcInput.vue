<template>
  <div class="row" style="height: 12em">
    <button @click="emit('miss')">&#10008;</button>
    <button @click="emit('hit')">&#10004;</button>
  </div>
  <button @click="emit('undo')">&#x232B;</button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  hit: []
  miss: []
  undo: []
}>()
</script>

<style scoped>
button {
  font-size: xx-large;
}
</style>
