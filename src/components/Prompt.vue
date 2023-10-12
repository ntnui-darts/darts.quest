<template>
  <p>{{ text }}</p>
  <div class="row">
    <button v-for="btn in buttons" @click="btn.onClick">{{ btn.text }}</button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text: string
  buttons: { text: string; onClick: () => void }[]
}>()
</script>
