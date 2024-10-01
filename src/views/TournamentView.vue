<template>
  <button id="back" @click="router.push({ name: 'tournament-lobby' })">
    Back
  </button>
  <template v-if="tournament">
    <h2>{{ tournament.name }}, {{ GameTypeNames[tournament.gameType] }}</h2>
    <div>
      {{ new Date(tournament.createdAt).toDateString() }}
      by {{ usersStore.getName(tournament.userId) }}
    </div>
    <div>
      First to {{ tournament.setsPerMatch }} sets, where each set has
      {{ tournament.legsPerSet }} legs. Notation is ( wonSets : wonLegs ).
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
      <template v-for="(column, x) in tournamentState.grid">
        <div
          style="
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
          "
        >
          <div style="flex: 2; min-height: 48px"></div>
          <template v-for="(player, y) in column">
            <button
              style="width: 100%"
              :class="{
                'outlined-white':
                  player && player.id == usersStore.getCurrentUser?.id,
                'outlined-red': player && player.wonMatch === false,
                'outlined-green': player && player.wonMatch === true,
              }"
            >
              <div v-if="player && x == tournamentState.grid.length - 1">
                👑
              </div>
              {{ usersStore.getName(player?.id) }}
              <span v-if="player && x < tournamentState.grid.length - 1">
                {{ `${player.setWins}:${player.legWins}` }}
              </span>
            </button>

            <div
              v-if="y % 2 == 1 || column.length == y + 1"
              style="flex: 2; min-height: 48px"
            ></div>
            <div
              v-if="y % 2 == 0 && column.length > y + 1"
              style="
                flex: 1;
                min-height: 24px;
                margin: 1px;
                background-color: gray;
                width: 4px;
              "
            ></div>
          </template>
        </div>
      </template>
    </div>

    <template v-if="tournamentState.matches.length">
      <h3>Current Matches</h3>
      <template v-for="match in tournamentState.matches">
        <div style="display: flex; gap: 1em; align-items: center">
          <button
            style="flex: 1"
            :class="{
              'outlined-white': match[0].id == usersStore.getCurrentUser?.id,
            }"
          >
            {{ usersStore.getName(match[0].id) }}
            {{ match[0] && ` ${match[0].setWins}:${match[0].legWins}` }}
          </button>
          <span>VS</span>
          <button
            style="flex: 1"
            :class="{
              'outlined-white': match[1].id == usersStore.getCurrentUser?.id,
            }"
          >
            {{ usersStore.getName(match[1].id) }}
            {{ match[1] && ` ${match[1].setWins}:${match[1].legWins}` }}
          </button>
        </div>
      </template>
    </template>

    <template v-if="finalWinner">
      <h2>👑 {{ usersStore.getName(finalWinner.id) }} won the tournament!</h2>
    </template>
    <br />

    <template v-if="tournament.userId == usersStore.getCurrentUser?.id">
      <button @click="onDeleteTournament">Delete tournament</button>
    </template>
    <br />

    <template v-if="myMatch">
      <button
        class="primary"
        style="position: sticky; bottom: 2em"
        @click="onPlay"
      >
        Play against {{ usersStore.getName(myOpponent?.id) }}
      </button>
    </template>
  </template>
</template>

<script lang="ts" setup>
import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import Prompt from '@/components/Prompt.vue'
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

type PlayerMatchState = {
  id: string | undefined
  legWins: number
  setWins: number
  wonMatch: boolean | undefined
}
const getMatchState = async (a?: PlayerMatchState, b?: PlayerMatchState) => {
  // Will set values in a and b.
  if (!tournament.value) return undefined
  if (!a || !b) return undefined
  a.legWins = 0
  a.setWins = 0
  a.wonMatch = undefined
  b.legWins = 0
  b.setWins = 0
  b.wonMatch = undefined

  const gamesResponse = await supabase
    .from('games')
    .select('tournamentId, result, createdAt')
    .eq('tournamentId', tournament.value.id)
    .contains('players', [a.id, b.id])
  if (!gamesResponse.data || gamesResponse.data.length == 0) return undefined

  const games = gamesResponse.data.toSorted(compareCreatedAt)

  for (const game of games) {
    const winner = game.result[0]
    if (winner == a.id) {
      a.legWins += 1
      if (a.legWins >= tournament.value.legsPerSet) {
        a.setWins += 1
        a.legWins = 0
        b.legWins = 0
        if (a.setWins >= tournament.value.setsPerMatch) {
          a.wonMatch = true
          b.wonMatch = false
          return a
        }
      }
    }
    if (winner == b.id) {
      b.legWins += 1
      if (b.legWins >= tournament.value.legsPerSet) {
        b.setWins += 1
        a.legWins = 0
        b.legWins = 0
        if (b.setWins >= tournament.value.setsPerMatch) {
          a.wonMatch = false
          b.wonMatch = true
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

  let prevRound: (PlayerMatchState | undefined)[] =
    tournament.value.players.map((id) => ({
      id,
      legWins: 0,
      setWins: 0,
      wonMatch: undefined,
    }))
  const grid = []
  const matches: [PlayerMatchState, PlayerMatchState][] = []
  const n_rounds = Math.ceil(Math.log2(prevRound.length)) + 1
  for (let round = 0; round < n_rounds; round++) {
    grid.push(prevRound)
    const thisRound = []
    for (let i = 0; i < prevRound.length - 1; i += 2) {
      const a = prevRound[i]
      const b = prevRound[i + 1]
      const winner = await getMatchState(a, b)
      thisRound.push(winner)
      if (a && b && !winner) {
        matches.push([a, b])
      }
    }
    if (prevRound.length % 2 == 1) {
      thisRound.push(prevRound.at(-1))
    }
    prevRound = structuredClone(thisRound)
  }

  useLoadingStore().loading = false

  return { grid, matches }
}

const refreshTournamentState = async () => {
  tournamentState.value = await getTournamentState()
}

const myMatch = computed(() =>
  tournamentState.value.matches.find((match) =>
    match.some(
      (p) => usersStore.getCurrentUser && p.id == usersStore.getCurrentUser.id
    )
  )
)

const myOpponent = computed(() => {
  if (!myMatch.value || !usersStore.getCurrentUser) return undefined
  if (myMatch.value[0].id == usersStore.getCurrentUser.id)
    return myMatch.value[1]
  if (myMatch.value[1].id == usersStore.getCurrentUser.id)
    return myMatch.value[0]
})

const finalWinner = computed(() => tournamentState.value.grid.at(-1)?.at(0))

const onPlay = () => {
  if (!tournament.value) return
  if (!myMatch.value) return
  const t = tournament.value
  useModalStore().push(
    TournamentPlayerSelection,
    { playerIds: myMatch.value.map((p) => p.id) },
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

const onDeleteTournament = async () => {
  const t = tournament.value
  if (!t) return

  // Don't allow delete if there are connected games
  const gamesResponse = await supabase
    .from('games')
    .select('tournamentId')
    .eq('tournamentId', t.id)
    .limit(1)
  if (gamesResponse.data && gamesResponse.data.length > 0) {
    useModalStore().push(
      Prompt,
      {
        text: `Cannot delete ${t.name} because it has been started.`,
        buttons: [{ text: 'Ok', onClick: () => useModalStore().pop() }],
      },
      {}
    )
    return
  }

  useModalStore().push(
    Prompt,
    {
      text: `Are you sure you want to cancel and delete ${t.name}?`,
      buttons: [
        { text: 'No', onClick: () => useModalStore().pop() },
        {
          text: 'Yes',
          onClick: async () => {
            await supabase.from('tournaments').delete().eq('id', t.id)
            useModalStore().pop()
            router.push({ name: 'tournament-lobby' })
          },
        },
      ],
    },
    {}
  )
}
</script>
