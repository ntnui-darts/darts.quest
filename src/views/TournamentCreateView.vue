<template>
  <button id="cancel" @click="router.push({ name: 'tournament-lobby' })">
    Cancel
  </button>

  <h2>New Tournament</h2>

  <label for="setsPerMatch">Tournament Name</label>
  <input id="tournamentName" v-model="gameSelectionStore.tournamentName" />

  <h2>Select Game Type</h2>
  <GameSelection
    :game-type="gameSelectionStore.gameType"
    :type-attributes="gameSelectionStore.gameTypeAttributes"
    @update-game-type="gameSelectionStore.gameType = $event"
    @update-type-attributes="gameSelectionStore.gameTypeAttributes = $event"
  ></GameSelection>

  <label for="setsPerMatch">Sets Per Match (First to ..)</label>
  <input
    id="setsPerMatch"
    type="number"
    v-model="gameSelectionStore.setsPerMatch"
  />
  <label for="legsPerSet">Legs Per Set (First to ..)</label>
  <input
    id="legsPerSet"
    type="number"
    v-model="gameSelectionStore.legsPerSet"
  />

  <PlayerSelection
    v-model:players="gameSelectionStore.players"
  ></PlayerSelection>

  <br />
  <button
    :class="{
      primary: gameSelectionStore.tournamentReady,
      shadow: true,
    }"
    :disabled="!gameSelectionStore.tournamentReady"
    @click="onCreateTournament"
  >
    Create tournament
  </button>
  <br />
  <br />
</template>

<script lang="ts" setup>
import GameSelection from '@/components/GameSelection.vue'
import PlayerSelection from '@/components/PlayerSelection.vue'
import { shuffle } from '@/functions/shuffle'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useGameSelectionStore } from '@/stores/gameSelection'
import { useUsersStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { nanoid } from 'nanoid'
import { onMounted } from 'vue'

const usersStore = useUsersStore()
const authStore = useAuthStore()
const gameSelectionStore = useGameSelectionStore()

onMounted(async () => {
  await useAuthStore().getSession()
  if (!authStore.auth) {
    router.push({ name: 'login' })
  }
})

const onCreateTournament = async () => {
  if (gameSelectionStore.players.length == 0) return
  if (!gameSelectionStore.gameType) return
  if (!usersStore.getCurrentUser) return

  await supabase.from('tournaments').insert({
    id: nanoid(),
    type: 'elimination', // TODO
    name: gameSelectionStore.tournamentName,
    userId: usersStore.getCurrentUser.id,
    players: shuffle(gameSelectionStore.players.map((p) => p.id)),
    gameType: gameSelectionStore.gameType,
    gameTypeAttributes: gameSelectionStore.gameTypeAttributes,
    legsPerSet: gameSelectionStore.legsPerSet,
    setsPerMatch: gameSelectionStore.setsPerMatch,
  })

  router.push({ name: 'tournament-lobby' })
}
</script>
