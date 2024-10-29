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
  <div class="row">
    <template v-for="(value, i) in gameSelectionStore.setsPerMatchArray">
      <input
        id="setsPerMatch"
        style="min-width: 16px; flex: 1"
        type="number"
        :min="1"
        :max="1000"
        :value="value"
        @input="(e) => {
          gameSelectionStore.setsPerMatchArray[i] = (e.target as HTMLInputElement)?.valueAsNumber ?? 1
        }"
      />
    </template>
  </div>
  <label for="legsPerSet">Legs Per Set (First to ..)</label>
  <div class="row">
    <template v-for="(value, i) in gameSelectionStore.legsPerSetArray">
      <input
        id="legsPerSet"
        style="min-width: 16px; flex: 1"
        type="number"
        :min="1"
        :max="1000"
        :value="value"
        @input="(e) => {
          gameSelectionStore.legsPerSetArray[i] = (e.target as HTMLInputElement)?.valueAsNumber ?? 1
        }"
      />
    </template>
  </div>

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
import { tournamentNumberOfRounds } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { nanoid } from 'nanoid'
import { onMounted, watch } from 'vue'

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

  validateLegsPerSetAndSetsPerMatch()

  await supabase.from('tournaments').insert({
    id: nanoid(),
    type: 'elimination', // TODO
    name: gameSelectionStore.tournamentName,
    userId: usersStore.getCurrentUser.id,
    players: shuffle(gameSelectionStore.players.map((p) => p.id)),
    gameType: gameSelectionStore.gameType,
    gameTypeAttributes: gameSelectionStore.gameTypeAttributes,
    legsPerSetArray: gameSelectionStore.legsPerSetArray,
    setsPerMatchArray: gameSelectionStore.setsPerMatchArray,
  })

  router.push({ name: 'tournament-lobby' })
}

const validateLegsPerSetAndSetsPerMatch = () => {
  const numRounds = tournamentNumberOfRounds(gameSelectionStore.players.length)
  for (const arr of [
    gameSelectionStore.legsPerSetArray,
    gameSelectionStore.setsPerMatchArray,
  ]) {
    while (arr.length > numRounds) {
      arr.pop()
    }
    while (arr.length < numRounds) {
      arr.push(arr.at(-1) ?? 1)
    }
  }
}

watch(
  () => gameSelectionStore.players.length,
  () => {
    validateLegsPerSetAndSetsPerMatch()
  }
)
</script>
