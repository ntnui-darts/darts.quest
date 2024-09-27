<template>
  <InstallationPrompt></InstallationPrompt>

  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'statistics' })">Statistics</button>
  </div>

  <div class="row">
    <button @click="router.push({ name: 'spectate-lobby' })">Spectate</button>
    <button @click="router.push({ name: 'tournament-lobby' })">
      Tournaments
    </button>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: end">
    <h2>Select Game Type</h2>
    <InfoSvg @click="showRules"></InfoSvg>
  </div>

  <GameSelection
    :game-type="gameSelectionStore.gameType"
    :type-attributes="gameSelectionStore.gameTypeAttributes"
    @update-game-type="gameSelectionStore.gameType = $event"
    @update-type-attributes="gameSelectionStore.gameTypeAttributes = $event"
  ></GameSelection>

  <PlayerSelection
    v-model:players="gameSelectionStore.players"
  ></PlayerSelection>

  <br />
  <button
    :class="{
      primary: gameSelectionStore.gameReady,
      shadow: true,
    }"
    :disabled="!gameSelectionStore.gameReady"
    style="position: sticky; bottom: 2em"
    @click="onPlay"
  >
    Play
  </button>
  <br />
  <br />
</template>

<script lang="ts" setup>
import GameRules from '@/components/GameRules.vue'
import GameSelection from '@/components/GameSelection.vue'
import InfoSvg from '@/components/InfoIcon.vue'
import InstallationPrompt from '@/components/InstallationPrompt.vue'
import PlayerSelection from '@/components/PlayerSelection.vue'
import ReloadView from '@/components/ReloadView.vue'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useGameSelectionStore } from '@/stores/gameSelection'
import { useModalStore } from '@/stores/modal'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const gameSelectionStore = useGameSelectionStore()

onMounted(async () => {
  await useAuthStore().getSession()
  if (!authStore.auth) {
    router.push({ name: 'login' })
  }
  if (localStorage.getItem('game')) {
    useModalStore().push(ReloadView, {}, {})
  }
})

const onPlay = () => {
  gameSelectionStore.play({ tournamentId: undefined })
}
const showRules = () => {
  useModalStore().push(GameRules, {}, {})
}
</script>
