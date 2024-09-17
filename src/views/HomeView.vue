<template>
  <InstallationPrompt></InstallationPrompt>

  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'statistics' })">Statistics</button>
  </div>
  <button @click="router.push({ name: 'spectate-lobby' })">Spectate</button>

  <div style="display: flex; justify-content: space-between; align-items: end">
    <h2>Select Game Type</h2>
    <InfoSvg @click="showRules"></InfoSvg>
  </div>

  <GameSelection
    :game-type="homeStore.gameType"
    :type-attributes="homeStore.typeAttributes"
    @update-game-type="homeStore.gameType = $event"
    @update-type-attributes="homeStore.typeAttributes = $event"
  ></GameSelection>

  <PlayerSelection v-model:players="homeStore.players"></PlayerSelection>

  <br />
  <button
    :class="{
      primary: homeStore.gameReady,
      shadow: true,
    }"
    :disabled="!homeStore.gameReady"
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
import { useGameStore } from '@/stores/game'
import { useHomeStore } from '@/stores/home'
import { useModalStore } from '@/stores/modal'
import { useUsersStore } from '@/stores/users'
import { Leg } from '@/types/game'
import { nanoid } from 'nanoid'
import { onMounted, watch } from 'vue'

const gameStore = useGameStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const homeStore = useHomeStore()

onMounted(async () => {
  await useAuthStore().getSession()
  if (!authStore.auth) {
    router.push({ name: 'login' })
  }
})

onMounted(() => {
  if (localStorage.getItem('game')) {
    useModalStore().push(ReloadView, {}, {})
  }
  scrollGameTypeButtonIntoView()
})

watch(
  () => homeStore.gameType,
  () => {
    scrollGameTypeButtonIntoView()
  }
)

const scrollGameTypeButtonIntoView = () => {
  const btn = document.querySelector(`button#${homeStore.gameType}`)
  btn?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
}

const onPlay = () => {
  if (homeStore.players.length == 0) return
  if (!homeStore.gameType) return
  if (!usersStore.getCurrentUser) return

  const gameId = nanoid()
  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    typeAttributes: homeStore.typeAttributes,
    type: homeStore.gameType,
    result: [],
    players: homeStore.players.map((player) => player.id),
    legs: homeStore.players.map(
      (player) =>
        ({
          id: nanoid(),
          userId: player.id,
          visits: [],
          arrows: player.arrows ?? 'unknown',
          confirmed: false,
          gameId: gameId,
          typeAttributes: homeStore.typeAttributes,
          type: homeStore.gameType!,
          beers: player.beers ?? null,
          finish: false,
          createdAt: new Date().toISOString(),
        } satisfies Leg)
    ),
    tournamentId: null,
  })
  router.push({ name: 'game' })
}
const showRules = () => {
  useModalStore().push(GameRules, {}, {})
}
</script>
