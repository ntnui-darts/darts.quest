<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button class="primary" @click="createTournament">
    Create new tournament
  </button>

  <h2>Tournaments</h2>
  <button
    v-for="tournament in tournamentStore.tournaments"
    @click="viewTournament(tournament.userId)"
  >
    {{ useUsersStore().getName(tournament.userId) }}
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useTournamentStore } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { onMounted } from 'vue'

const tournamentStore = useTournamentStore()

onMounted(async () => {
  await tournamentStore.fetchTournaments()
})

const viewTournament = async (tournamentId: string) => {
  await tournamentStore.fetchTournament(tournamentId)
  router.push({ name: 'tournament' })
}

const createTournament = () => {
  router.push({ name: 'tournament-create' })
}
</script>
