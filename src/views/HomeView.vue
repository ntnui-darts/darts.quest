<template>
  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'statistics' })">Statistics</button>
  </div>
  <h2>Select Game Type</h2>

  <div
    class="col"
    style="gap: 0; background-color: rgb(43, 43, 43); border-radius: 0.5em"
  >
    <div class="row options">
      <button
        v-for="(name, type) in GameTypeNames"
        :class="{ selected: type == gameType }"
        style="font-size: larger"
        @click="selectGameType(type)"
      >
        {{ name }}
      </button>
    </div>
    <div v-auto-animate class="col" style="padding: 1em">
      <component
        v-if="getOptionsComponent(gameType)"
        :is="getOptionsComponent(gameType)"
        :key="gameType"
        @update="typeAttributes = $event"
      ></component>
    </div>
  </div>
  <PlayerSelection @update="players = $event"></PlayerSelection>
  <br />
  <button
    :class="{
      primary: players.length >= getMinPlayerCount(gameType),
    }"
    :disabled="players.length < getMinPlayerCount(gameType)"
    style="
      position: sticky;
      bottom: 2em;
      box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.2);
    "
    @click="onPlay"
  >
    Play
  </button>
  <br />
  <br />
</template>

<script lang="ts" setup>
import ReloadView from '@/components/ReloadView.vue'
import { router } from '@/router'
import { Leg } from '@/types/game'
import { useUsersStore } from '@/stores/users'
import { nanoid } from 'nanoid'
import { onMounted, ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import PlayerSelection, {
  UserCurrentInfo,
} from '@/components/PlayerSelection.vue'
import { useAuthStore } from '@/stores/auth'
import {
  getMinPlayerCount,
  getOptionsComponent,
  GameTypeNames,
  GameType,
} from '@/games/games'

const gameStore = useGameStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const typeAttributes = ref<string[]>([])
const players = ref<UserCurrentInfo[]>([])
const gameType = ref<GameType>('x01')

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

const selectGameType = (type: GameType) => {
  if (gameType.value == type) return
  gameType.value = type
}

const onPlay = () => {
  if (players.value.length == 0) return
  if (!gameType.value) return
  if (!usersStore.getCurrentUser) return
  const gameId = nanoid()

  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    typeAttributes: typeAttributes.value,
    type: gameType.value,
    result: [],
    players: players.value.map((player) => player.id),
    legs: players.value.map(
      (player) =>
        ({
          id: nanoid(),
          userId: player.id,
          visits: [],
          arrows: player.arrows ?? 'unknown',
          confirmed: false,
          gameId: gameId,
          typeAttributes: typeAttributes.value,
          type: gameType.value!,
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
