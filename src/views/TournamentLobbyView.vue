<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button class="primary" @click="createTournament">
    Create new tournament
  </button>

  <h2>Tournaments</h2>
  <button
    v-for="tournament in tournamentStore.tournaments"
    @click="viewTournament(tournament.id)"
  >
    <span>{{ tournament.name }}</span>
    <span>, {{ GameTypeNames[tournament.gameType] }}</span>
    <br />
    <br />
    <span>{{ new Date(tournament.createdAt).toDateString() }}</span>
    <span> by {{ useUsersStore().getName(tournament.userId) }}</span>
  </button>
</template>

<script lang="ts" setup>
import { GameTypeNames } from '@/games/games'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useTournamentStore } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { onMounted } from 'vue'

const tournamentStore = useTournamentStore()

onMounted(async () => {
  await useAuthStore().getSession()
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
