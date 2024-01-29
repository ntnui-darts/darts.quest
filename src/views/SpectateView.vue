<template>
  <button id="back" @click="router.push({ name: 'spectate-lobby' })">
    Back
  </button>

  <h2>Spectating {{ onlineStore.spectating }}</h2>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useOnlineStore } from '@/stores/online'
import { watch } from 'vue'

const onlineStore = useOnlineStore()

watch(
  () => onlineStore.spectating,
  (spectating) => {
    if (!spectating) {
      router.push({ name: 'spectate-lobby' })
    }
  },
  { immediate: true }
)
</script>
