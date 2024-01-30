<template>
  <button id="back" @click="router.push({ name: 'spectate-lobby' })">
    Back
  </button>

  <h2>Spectating {{ name }}</h2>

  <template v-if="onlineStore.spectatingGame && gameController && gameState">
    <MainGame
      :show-input="false"
      :show-save="false"
      :game="onlineStore.spectatingGame"
      :game-state="gameState"
      :game-controller="gameController"
    ></MainGame>
  </template>
  <p v-else-if="onlineStore.getSpectating?.inGame">
    {{ name }} is playing. Waiting for update..
  </p>
  <p v-else>{{ name }} is active, but not currently playing.</p>
</template>

<script lang="ts" setup>
import MainGame from '@/components/MainGame.vue'
import { getGameController } from '@/games/games'
import { router } from '@/router'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'
import { computed, onUnmounted, watch } from 'vue'

const onlineStore = useOnlineStore()

const name = computed(
  () => useUsersStore().getUser(onlineStore.getSpectating?.userId)?.name
)

const gameController = computed(() =>
  onlineStore.spectatingGame
    ? getGameController(onlineStore.spectatingGame)
    : null
)

const gameState = computed(() => gameController.value?.getGameState())

watch(
  () => onlineStore.getSpectating,
  (spectating) => {
    if (!spectating) {
      router.push({ name: 'spectate-lobby' })
    }
  },
  { immediate: true }
)

watch(
  () => onlineStore.getSpectating?.inGame,
  (inGame) => {
    if (!inGame) {
      onlineStore.spectatingGame = null
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  onlineStore.stopSpectating()
})
</script>
