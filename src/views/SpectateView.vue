<template>
  <button id="back" @click="router.push({ name: 'spectate-lobby' })">
    Back
  </button>

  <h2>Spectating {{ name }}</h2>

  <template v-if="onlineStore.spectatingGame && gameController && gameState">
    <MainGame
      :show-input="
        !!gameState.player &&
        gameState.player == useAuthStore().auth?.id &&
        !!onlineStore.getSpectating?.remotePlayers.includes(gameState.player)
      "
      :show-save="false"
      :game="onlineStore.spectatingGame"
      :game-state="gameState"
      :game-controller="gameController"
      @hit="onlineStore.sendInput('hit', $event)"
      @miss="onlineStore.sendInput('miss')"
      @undo="onlineStore.sendInput('undo')"
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
import { useAuthStore } from '@/stores/auth'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'
import { computed, onUnmounted, watch } from 'vue'

const onlineStore = useOnlineStore()

const name = computed(() =>
  useUsersStore().getName(onlineStore.getSpectating?.userId)
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
