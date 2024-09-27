<template>
  <button id="back" @click="router.push({ name: 'tournament-lobby' })">
    Back
  </button>
  <template v-if="tournament">
    <h2>{{ tournament.name }}, {{ GameTypeNames[tournament.gameType] }}</h2>
    <div>
      <span>{{ new Date(tournament.createdAt).toDateString() }}</span>
      <span> by {{ usersStore.getName(tournament.userId) }}</span>
    </div>

    <div class="row spaced">
      <h3>Overview</h3>
      <button style="flex: 0" @click="refreshTournamentState">Refresh</button>
    </div>
    <div
      style="
        display: flex;
        flex-direction: row;
        gap: 1em;
        overflow: auto;
        padding: 2px;
      "
    >
      <template v-for="column in tournamentState.grid">
        <div
          style="
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            gap: 1em;
          "
        >
          <template v-for="player in column">
            <button
              :class="{ outlined: player == usersStore.getCurrentUser?.id }"
            >
              {{ usersStore.getName(player) }}
            </button>
          </template>
        </div>
      </template>
    </div>

    <h3>Current Matches</h3>
    <template v-for="match in tournamentState.matches">
      <div style="display: flex; gap: 1em; align-items: center">
        <button
          style="flex: 1"
          :class="{ outlined: match[0] == usersStore.getCurrentUser?.id }"
        >
          {{ usersStore.getName(match[0]) }}
        </button>
        <span>VS</span>
        <button
          style="flex: 1"
          :class="{ outlined: match[1] == usersStore.getCurrentUser?.id }"
        >
          {{ usersStore.getName(match[1]) }}
        </button>
      </div>
    </template>
    <br />
    <br />

    <template v-if="myMatch">
      <button
        class="primary"
        style="position: sticky; bottom: 2em"
        @click="onPlay"
      >
        Play against {{ usersStore.getName(myOpponent) }}
      </button>
    </template>
  </template>
</template>

<script lang="ts" setup>
import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import TournamentPlayerSelection from '@/components/TournamentPlayerSelection.vue'
import { compareCreatedAt } from '@/functions/compare'
import { GameTypeNames } from '@/games/games'
import { router } from '@/router'
import { useGameSelectionStore } from '@/stores/gameSelection'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { useTournamentStore } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { computed, onMounted, ref } from 'vue'

type TournamentState = Awaited<ReturnType<typeof getTournamentState>>

const tournamentStore = useTournamentStore()
const usersStore = useUsersStore()

const tournament = computed(() => tournamentStore.currentTournament)
const tournamentState = ref<TournamentState>({ grid: [], matches: [] })

onMounted(async () => {
  if (!tournament.value) {
    router.push({ name: 'tournament-lobby' })
  }
  refreshTournamentState()
})

const findWinner = async (a: string | undefined, b: string | undefined) => {
  if (!tournament.value) return undefined
  if (!a || !b) return undefined

  const gamesResponse = await supabase
    .from('games')
    .select('*')
    .eq('tournamentId', tournament.value.id)
    .contains('players', [a, b])
  if (!gamesResponse.data || gamesResponse.data.length == 0) return undefined

  const games = gamesResponse.data.toSorted(compareCreatedAt)
  let aLegWins = 0
  let aSetWins = 0
  let bLegWins = 0
  let bSetWins = 0

  for (const game of games) {
    const winner = game.result[0]
    if (winner == a) {
      aLegWins += 1
      if (aLegWins >= tournament.value.legsPerSet) {
        aSetWins += 1
        aLegWins = 0
        bLegWins = 0
        if (aSetWins >= tournament.value.setsPerMatch) {
          return a
        }
      }
    }
    if (winner == b) {
      bLegWins += 1
      if (bLegWins >= tournament.value.legsPerSet) {
        bSetWins += 1
        aLegWins = 0
        bLegWins = 0
        if (bSetWins >= tournament.value.setsPerMatch) {
          return b
        }
      }
    }
  }

  return undefined
}

const getTournamentState = async () => {
  if (!tournament.value) return { grid: [], matches: [] }

  useLoadingStore().loading = true

  let prevRound: (string | undefined)[] = [...tournament.value.players]
  const grid = []
  const matches: [string, string][] = []
  const n_rounds = Math.ceil(Math.log2(prevRound.length)) + 1
  for (let round = 0; round < n_rounds; round++) {
    grid.push(prevRound)
    const thisRound = []
    for (let i = 0; i < prevRound.length - 1; i += 2) {
      const a = prevRound[i]
      const b = prevRound[i + 1]
      const winner = await findWinner(a, b)
      thisRound.push(winner)
      if (a && b && !winner) {
        matches.push([a, b])
      }
    }
    if (prevRound.length % 2 == 1) {
      thisRound.push(prevRound.at(-1))
    }
    prevRound = [...thisRound]
  }

  useLoadingStore().loading = false

  return { grid, matches }
}

const refreshTournamentState = async () => {
  tournamentState.value = await getTournamentState()
}

const myMatch = computed(() =>
  tournamentState.value.matches.find(
    (match) =>
      usersStore.getCurrentUser && match.includes(usersStore.getCurrentUser.id)
  )
)

const myOpponent = computed(() => {
  if (!myMatch.value || !usersStore.getCurrentUser) return undefined
  if (myMatch.value[0] == usersStore.getCurrentUser.id) return myMatch.value[1]
  if (myMatch.value[1] == usersStore.getCurrentUser.id) return myMatch.value[0]
})

const onPlay = () => {
  if (!tournament.value) return
  if (!myMatch.value) return
  const t = tournament.value
  useModalStore().push(
    TournamentPlayerSelection,
    { players: myMatch.value },
    {
      submit: (players: UserCurrentInfo[]) => {
        if (!tournament.value) return
        useGameSelectionStore().play({
          tournamentId: t.id,
          gameType: t.gameType,
          gameTypeAttributes: t.gameTypeAttributes,
          players: players,
        })
        useModalStore().pop()
      },
    }
  )
}
</script>
