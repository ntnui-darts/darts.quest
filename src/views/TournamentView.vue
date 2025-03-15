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
      <table style="width: 100%; text-align: center">
        <thead>
          <tr>
            <th>Round</th>
            <th>First to (sets)</th>
            <th>First to (legs)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(label, i) in rounds">
            <td>{{ label }}</td>
            <td>{{ tournament.setsPerMatchArray?.at(i) }}</td>
            <td>{{ tournament.legsPerSetArray?.at(i) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row spaced">
      <h3>Overview</h3>
      <button style="flex: 0" @click="refreshTournamentState">Refresh</button>
    </div>
    <div
      id="tournament-bracket"
      ref="tournamentBracketDiv"
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
            white-space: nowrap;
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
              <div>
                {{ stringMaxLength(usersStore.getName(player?.id), 14) }}
              </div>
              <template v-if="player && x < tournamentState.grid.length - 1">
                <div v-if="tournament.setsPerMatchArray?.at(x) == 1">
                  {{ player.legWins.at(-1) }}
                </div>
                <div v-else>
                  {{ player.setWins }}
                </div>
              </template>
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
      <button @click="onDownloadBracket">Export as image</button>
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
import { stringMaxLength } from '@/functions/string'
import { GameTypeNames } from '@/games/games'
import { router } from '@/router'
import { useGameSelectionStore } from '@/stores/gameSelection'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import {
  tournamentNumberOfRounds,
  useTournamentStore,
} from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { toPng as htmlToPng } from 'html-to-image'
import { computed, onMounted, ref } from 'vue'

type TournamentState = Awaited<ReturnType<typeof getTournamentState>>

const tournamentStore = useTournamentStore()
const usersStore = useUsersStore()

const tournament = computed(() => tournamentStore.currentTournament)
const tournamentState = ref<TournamentState>({ grid: [], matches: [] })
const tournamentGames = ref<
  {
    tournamentId: string | null
    result: string[]
    createdAt: string
    players: string[]
  }[]
>([])

const tournamentBracketDiv = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  if (!tournament.value) {
    router.push({ name: 'tournament-lobby' })
  }
  refreshTournamentState()
})

const rounds = computed(() => {
  if (tournament.value == null) {
    return []
  }

  const n = tournamentNumberOfRounds(tournament.value.players.length)
  const roundLabels = Array(n).map((_, i) => i + 'th')
  if (roundLabels.length > 1) {
    roundLabels[0] = '1st'
  }
  if (roundLabels.length > 2) {
    roundLabels[1] = '2nd'
  }
  if (roundLabels.length > 3) {
    roundLabels[2] = '3rd'
  }
  if (roundLabels.length > 1) {
    roundLabels[n - 1] = 'Final'
  }
  if (roundLabels.length > 2) {
    roundLabels[n - 2] = 'Semi-final'
  }
  if (roundLabels.length > 3) {
    roundLabels[n - 3] = 'Quarter-final'
  }
  return roundLabels
})

type PlayerMatchState = {
  id: string | undefined
  legWins: number[]
  setWins: number
  wonMatch: boolean | undefined
}
const getMatchState = async (
  _a: PlayerMatchState | undefined,
  _b: PlayerMatchState | undefined,
  matchIndex: number
) => {
  // Will set values in a and b.
  if (!tournament.value) return undefined
  const a = _a
  const b = _b
  if (!a || !b) return undefined
  if (a.id == b.id) return undefined
  for (const p of [a, b]) {
    p.legWins = [0]
    p.setWins = 0
    p.wonMatch = undefined
  }

  if (tournamentGames.value.length == 0) return undefined

  const games = tournamentGames.value.filter(
    (g) => a.id && b.id && g.players.includes(a.id) && g.players.includes(b.id)
  )

  for (const game of games) {
    const winnerId = game.result[0]
    const [winner, loser] =
      a.id == winnerId ? [a, b] : b.id == winnerId ? [b, a] : [null, null]
    if (!winner || !loser) continue
    winner.legWins[winner.legWins.length - 1] += 1
    if (
      winner.legWins[winner.legWins.length - 1] >=
      (tournament.value.legsPerSetArray?.at(matchIndex) ?? 1)
    ) {
      winner.setWins += 1

      if (
        winner.setWins >=
        (tournament.value.setsPerMatchArray?.at(matchIndex) ?? 1)
      ) {
        winner.wonMatch = true
        loser.wonMatch = false
        return winner
      } else {
        winner.legWins.push(0)
        loser.legWins.push(0)
      }
    }
  }
  return undefined
}

const getTournamentState = async () => {
  if (!tournament.value) return { grid: [], matches: [] }

  useLoadingStore().loading = true

  const gamesResponse = await supabase
    .from('games')
    .select('tournamentId, result, createdAt, players')
    .eq('tournamentId', tournament.value.id)

  if (gamesResponse.data) {
    tournamentGames.value = gamesResponse.data
  } else {
    tournamentGames.value = []
  }

  let prevRound: (PlayerMatchState | undefined)[] =
    tournament.value.players.map((id) => ({
      id,
      legWins: [0],
      setWins: 0,
      wonMatch: undefined,
    }))
  const grid = []
  const matches: [PlayerMatchState, PlayerMatchState][] = []
  const n_columns =
    tournamentNumberOfRounds(tournament.value.players.length) + 1

  for (let round = 0; round < n_columns; round++) {
    const readonlyPrevRound = [...prevRound]

    const thisRound = []

    const n_matches =
      2 * readonlyPrevRound.length -
      Math.pow(2, Math.ceil(Math.log2(readonlyPrevRound.length)))

    for (let i = 0; i < n_matches; i += 2) {
      const a = readonlyPrevRound[i]
      const b = readonlyPrevRound[i + 1]
      const winner = await getMatchState(a, b, round)
      thisRound.push(winner)
      if (a && b && !winner) {
        matches.push([a, b])
      }
    }
    for (let i = n_matches; i < readonlyPrevRound.length; i++) {
      thisRound.push(readonlyPrevRound[i])
      const index = prevRound.indexOf(readonlyPrevRound[i])
      if (index >= 0) {
        prevRound.splice(index + 1, 0, undefined)
      }
    }

    grid.push(prevRound)
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

const onDownloadBracket = () => {
  const divElement = tournamentBracketDiv.value
  if (!divElement) return

  // get font size to convert em to pixels
  // (flex gap between columns is specified in em)
  const fontSize = parseFloat(
    window
      .getComputedStyle(divElement.parentElement as HTMLElement, null)
      .getPropertyValue('font-size')
  )
  const numRounds = tournamentState.value.grid.length
  const columnWidth = divElement.children[0].getBoundingClientRect().width
  const imageWidth = Math.ceil(numRounds * columnWidth + numRounds * fontSize)
  htmlToPng(divElement, {
    backgroundColor: '#242424', // var(--c-background)
    width: imageWidth,
    style: {
      justifyContent: 'space-evenly',
    },
  }).then((dataUrl) => {
    // download on click
    const link = document.createElement('a')
    link.hidden = true
    link.download = `${tournament.value?.name}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}
</script>
