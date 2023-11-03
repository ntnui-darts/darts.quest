<template>
  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'statistics' })">Statistics</button>
  </div>
  <h2>Select Game Type</h2>

  <div
    class="col shadow"
    style="
      gap: 0;
      background-color: rgb(43, 43, 43);
      border-radius: 0.5em;
      padding-bottom: 0.5em;
    "
  >
    <div class="row options">
      <button
        v-for="(name, type) in GameTypeNames"
        :class="{ selected: type == homeStore.gameType }"
        style="font-size: larger"
        @click="homeStore.gameType = type"
      >
        {{ name }}
      </button>
    </div>
    <div v-auto-animate class="col" style="padding: 1em">
      <component
        v-if="getOptionsComponent(homeStore.gameType)"
        :is="getOptionsComponent(homeStore.gameType)"
        :key="homeStore.gameType"
        :type-attributes="homeStore.typeAttributes"
        @update="homeStore.typeAttributes = $event"
      ></component>
    </div>
  </div>
  <PlayerSelection
    :players="homeStore.players"
    @update="homeStore.players = $event"
  ></PlayerSelection>
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
import ReloadView from '@/components/ReloadView.vue'
import PlayerSelection from '@/components/PlayerSelection.vue'
import { router } from '@/router'
import { Leg } from '@/types/game'
import { useUsersStore } from '@/stores/users'
import { useHomeStore } from '@/stores/home'
import { nanoid } from 'nanoid'
import { onMounted } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { getOptionsComponent, GameTypeNames } from '@/games/games'

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
  if (localStorage.getItem('data')) {
    useModalStore().push(ReloadView, {}, {})
  }
})

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
  })
  router.push({ name: 'game' })
}
</script>

<style></style>
