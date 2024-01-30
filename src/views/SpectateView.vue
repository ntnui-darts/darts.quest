<template>
  <button id="back" @click="router.push({ name: 'spectate-lobby' })">
    Back
  </button>

  <template v-if="onlineStore.getSpectating">
    <h2>Spectating {{ name }}</h2>

    <p v-if="onlineStore.getSpectating.inGame">{{ name }} is in game.</p>
    <p v-else>{{ name }} is not in game.</p>

    {{ onlineStore.spectatingGame }}
  </template>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'
import { computed, onUnmounted, watch } from 'vue'

const onlineStore = useOnlineStore()

const name = computed(
  () => useUsersStore().getUser(onlineStore.getSpectating?.userId)?.name
)

watch(
  () => onlineStore.getSpectating,
  (spectating) => {
    if (!spectating) {
      router.push({ name: 'spectate-lobby' })
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  onlineStore.stopSpectating()
})
</script>
