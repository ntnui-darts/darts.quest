<template>
  <button id="back" @click="router.push({ name: 'tournament-lobby' })">
    Back
  </button>
  <template v-if="tournament">
    <h2>{{ tournament.name }}, {{ GameTypeNames[tournament.gameType] }}</h2>
    <div>
      {{ new Date(tournament.createdAt).toDateString() }}
      by {{ usersStore.getName(tournament.userId) }} · {{ typeLabel }}
    </div>
    <div v-if="!isRoundRobin">
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
    <div v-else>
      Everyone plays everyone once{{ isGrouped ? ' in their group' : '' }}. Each
      match is first to {{ tournament.setsPerMatchArray?.at(0) ?? 1 }} set(s),
      first to {{ tournament.legsPerSetArray?.at(0) ?? 1 }} leg(s) per set.
    </div>

    <div class="row spaced">
      <h3>Overview</h3>
      <button style="flex: 0" @click="refreshTournamentState">Refresh</button>
    </div>
    <div
      v-if="!isRoundRobin"
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
    <div v-else id="round-robin" ref="roundRobinDiv" style="padding: 2px">
      <template v-for="(group, g) in roundRobinState.groups" :key="g">
        <h2 v-if="isGrouped">{{ groupLabel(g) }}</h2>
        <h3>Standings</h3>
        <table style="width: 100%; text-align: center">
          <thead>
            <tr>
              <th>#</th>
              <th style="text-align: left">Player</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>+/-</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in group.standings"
              :key="row.id"
              :style="{
                fontWeight:
                  row.id == usersStore.getCurrentUser?.id ? 'bold' : 'normal',
              }"
            >
              <td>{{ i + 1 }}</td>
              <td style="text-align: left">
                {{ stringMaxLength(usersStore.getName(row.id), 14) }}
              </td>
              <td>{{ row.played }}</td>
              <td>{{ row.won }}</td>
              <td>{{ row.lost }}</td>
              <td>{{ row.legsFor - row.legsAgainst }}</td>
              <td>{{ row.points }}</td>
            </tr>
          </tbody>
        </table>

        <h3>Fixtures</h3>
        <template v-for="(fixtures, r) in group.rounds" :key="r">
          <h4>Round {{ r + 1 }}</h4>
          <div
            v-for="fixture in fixtures"
            :key="fixture.aId + fixture.bId"
            style="
              display: flex;
              gap: 1em;
              align-items: center;
              margin-bottom: 4px;
            "
          >
            <button
              style="flex: 1"
              :class="{
                'outlined-white': fixture.aId == usersStore.getCurrentUser?.id,
                'outlined-green': fixture.result.winnerId == fixture.aId,
                'outlined-red': fixture.result.winnerId == fixture.bId,
              }"
            >
              {{ stringMaxLength(usersStore.getName(fixture.aId), 14) }}
              {{ fixtureScore(fixture.result.a) }}
            </button>
            <span>VS</span>
            <button
              style="flex: 1"
              :class="{
                'outlined-white': fixture.bId == usersStore.getCurrentUser?.id,
                'outlined-green': fixture.result.winnerId == fixture.bId,
                'outlined-red': fixture.result.winnerId == fixture.aId,
              }"
            >
              {{ stringMaxLength(usersStore.getName(fixture.bId), 14) }}
              {{ fixtureScore(fixture.result.b) }}
            </button>
            <button
              v-if="canPlayFixture(fixture)"
              class="primary"
              style="flex: 0"
              @click="startMatch([fixture.aId, fixture.bId])"
            >
              Play
            </button>
          </div>
        </template>
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

    <template v-if="finalWinner || groupWinners.length">
      <h2 v-if="finalWinner">
        👑 {{ usersStore.getName(finalWinner.id) }} won the tournament!
      </h2>
      <template v-else>
        <h2>Group winners</h2>
        <div v-for="(id, g) in groupWinners" :key="g">
          👑 {{ groupLabel(g) }}: {{ usersStore.getName(id) }}
        </div>
        <br />
      </template>
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
import {
  EliminationState,
  Fixture,
  getEliminationState,
  getGroupedRoundRobinState,
  GroupedRoundRobinState,
  groupLabel,
  parseGroupCount,
  parseTournamentType,
  SideState,
} from '@/functions/tournament'
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

const tournamentStore = useTournamentStore()
const usersStore = useUsersStore()

const tournament = computed(() => tournamentStore.currentTournament)
const tournamentType = computed(() =>
  parseTournamentType(tournament.value?.type)
)
const isRoundRobin = computed(() => tournamentType.value == 'round-robin')
const groupCount = computed(() => parseGroupCount(tournament.value?.type))
const isGrouped = computed(() => isRoundRobin.value && groupCount.value > 1)
const typeLabel = computed(() => {
  if (isGrouped.value) return `Round robin, ${groupCount.value} groups`
  return {
    elimination: 'Elimination',
    'elimination-seeded': 'Elimination (seeded)',
    'round-robin': 'Round robin',
  }[tournamentType.value]
})

// Only one of these is used, depending on the type of the tournament.
const tournamentState = ref<EliminationState>({ grid: [], matches: [] })
const roundRobinState = ref<GroupedRoundRobinState>({
  groups: [],
  finished: false,
})
const tournamentGames = ref<
  {
    tournamentId: string | null
    result: string[]
    createdAt: string
    players: string[]
  }[]
>([])

const tournamentBracketDiv = ref<HTMLDivElement | null>(null)
const roundRobinDiv = ref<HTMLDivElement | null>(null)

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

const refreshTournamentState = async () => {
  const t = tournament.value
  if (!t) return

  useLoadingStore().loading = true

  const gamesResponse = await supabase
    .from('games')
    .select('tournamentId, result, createdAt, players')
    .eq('tournamentId', t.id)
  tournamentGames.value = gamesResponse.data ?? []

  if (isRoundRobin.value) {
    roundRobinState.value = getGroupedRoundRobinState(
      t.players,
      groupCount.value,
      tournamentGames.value,
      t.legsPerSetArray,
      t.setsPerMatchArray
    )
  } else {
    tournamentState.value = getEliminationState(
      t.players,
      tournamentType.value,
      tournamentGames.value,
      t.legsPerSetArray,
      t.setsPerMatchArray
    )
  }

  useLoadingStore().loading = false
}

// Score shown next to a name, same rule as in the bracket: legs when a match
// is a single set, otherwise sets.
const fixtureScore = (side: SideState) =>
  (tournament.value?.setsPerMatchArray?.at(0) ?? 1) == 1
    ? (side.legWins.at(-1) ?? 0)
    : side.setWins

const canPlayFixture = (fixture: Fixture) => {
  const me = usersStore.getCurrentUser?.id
  if (!me || fixture.result.winnerId) return false
  return fixture.aId == me || fixture.bId == me
}

// Elimination only. In a round robin there is no single "my match", so the
// fixture list has a Play button on each open fixture instead.
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

// With one group the top of the table wins. With several groups there is one
// winner per group instead, see groupWinners.
const finalWinner = computed(() => {
  if (isRoundRobin.value) {
    if (isGrouped.value || !roundRobinState.value.finished) return undefined
    return roundRobinState.value.groups.at(0)?.standings.at(0)
  }
  return tournamentState.value.grid.at(-1)?.at(0)
})

const groupWinners = computed(() =>
  isGrouped.value && roundRobinState.value.finished
    ? roundRobinState.value.groups.flatMap((group) => {
        const winner = group.standings.at(0)
        return winner ? [winner.id] : []
      })
    : []
)

const onPlay = () => {
  if (!myMatch.value) return
  startMatch(myMatch.value.map((p) => p.id))
}

const startMatch = (playerIds: string[]) => {
  if (!tournament.value) return
  const t = tournament.value
  useModalStore().push(
    TournamentPlayerSelection,
    { playerIds },
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

const downloadImage = (dataUrl: string) => {
  // download on click
  const link = document.createElement('a')
  link.hidden = true
  link.download = `${tournament.value?.name}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const onDownloadBracket = () => {
  if (isRoundRobin.value) {
    // Standings and fixtures are plain blocks, no column math needed.
    if (!roundRobinDiv.value) return
    htmlToPng(roundRobinDiv.value, {
      backgroundColor: '#242424', // var(--c-background)
    }).then(downloadImage)
    return
  }

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
  }).then(downloadImage)
}
</script>
