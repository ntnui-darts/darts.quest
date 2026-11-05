<template>
  <button id="cancel" @click="router.push({ name: 'tournament-lobby' })">
    Cancel
  </button>

  <h2>New Tournament</h2>

  <label for="setsPerMatch">Tournament Name</label>
  <input id="tournamentName" v-model="gameSelectionStore.tournamentName" />

  <h2>Format</h2>
  <div class="row">
    <button
      style="flex: 1"
      :class="{ primary: gameSelectionStore.tournamentFormat == 'elimination' }"
      @click="gameSelectionStore.tournamentFormat = 'elimination'"
    >
      Elimination
    </button>
    <button
      style="flex: 1"
      :class="{ primary: gameSelectionStore.tournamentFormat == 'round-robin' }"
      @click="gameSelectionStore.tournamentFormat = 'round-robin'"
    >
      Round robin
    </button>
  </div>
  <p v-if="gameSelectionStore.tournamentFormat == 'round-robin'">
    Everyone plays everyone once. Two points for a win, the best total wins the
    tournament.
  </p>

  <template v-if="isRoundRobin && maxGroups > 1">
    <h2>Groups</h2>
    <div class="row">
      <button
        v-for="count in maxGroups"
        :key="count"
        style="flex: 1"
        :class="{ primary: gameSelectionStore.roundRobinGroups == count }"
        @click="gameSelectionStore.roundRobinGroups = count"
      >
        {{ count }}
      </button>
    </div>
    <p>
      <template v-if="gameSelectionStore.roundRobinGroups == 1">
        Everyone plays in one group.
      </template>
      <template v-else>
        {{ groupSizeText }} Everyone plays everyone in their own group, and each
        group has its own winner.
      </template>
    </p>
  </template>

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
        @input="
          (e) => {
            gameSelectionStore.setsPerMatchArray[i] =
              (e.target as HTMLInputElement)?.valueAsNumber ?? 1
          }
        "
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
        @input="
          (e) => {
            gameSelectionStore.legsPerSetArray[i] =
              (e.target as HTMLInputElement)?.valueAsNumber ?? 1
          }
        "
      />
    </template>
  </div>

  <template v-if="isElimination || isGrouped">
    <h2>{{ isElimination ? 'Bracket' : 'Draw' }}</h2>
    <div class="row">
      <button
        v-for="option in bracketOptions"
        :key="option.value"
        style="flex: 1"
        :class="{ primary: gameSelectionStore.bracketOrder == option.value }"
        @click="gameSelectionStore.bracketOrder = option.value"
      >
        {{ option.label }}
      </button>
    </div>
    <template v-if="isGrouped">
      <p v-if="gameSelectionStore.bracketOrder == 'random'">
        Players are drawn into the groups at random.
      </p>
      <p v-else-if="gameSelectionStore.bracketOrder == 'manual'">
        Drag the players below to swap places. The top of the list fills Group
        A, the next players fill Group B and so on.
      </p>
      <p v-else>
        Put the best player at the top and the weakest at the bottom, and drag
        to swap places. The groups are dealt out snake style (A B C, C B A, ...)
        so every group gets players of similar strength.
      </p>
    </template>
    <p v-else-if="gameSelectionStore.bracketOrder == 'random'">
      Players are drawn into the bracket at random.
    </p>
    <p v-else-if="gameSelectionStore.bracketOrder == 'manual'">
      Drag the players below to swap places. They are paired from the top: 1st
      vs 2nd, 3rd vs 4th and so on. If the number of players is not a power of
      two, the players at the bottom get a bye in the first round.
    </p>
    <p v-else>
      Put the best player at the top and the weakest at the bottom, and drag to
      swap places. The bracket is built from that ranking, so the top seeds meet
      as late as possible and get the byes.
    </p>
  </template>

  <PlayerSelection
    v-model:players="gameSelectionStore.players"
    :disable-custom="true"
    :disable-drag="!orderMatters"
  ></PlayerSelection>

  <template v-if="orderMatters && pairings.length > 1">
    <h3>{{ isGrouped ? 'Groups' : 'First round' }}</h3>
    <div v-for="pairing in pairings" :key="pairing">{{ pairing }}</div>
  </template>

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
import {
  BracketOrder,
  firstRoundPairings,
  groupLabel,
  groupSizes,
  maxGroupCount,
  snakeOrder,
  splitIntoGroups,
  tournamentTypeFor,
} from '@/functions/tournament'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useGameSelectionStore } from '@/stores/gameSelection'
import { tournamentNumberOfRounds } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { nanoid } from 'nanoid'
import { computed, onMounted, watch } from 'vue'

const usersStore = useUsersStore()
const authStore = useAuthStore()
const gameSelectionStore = useGameSelectionStore()

const bracketOptions: { value: BracketOrder; label: string }[] = [
  { value: 'random', label: 'Random draw' },
  { value: 'manual', label: 'Manual' },
  { value: 'seeded', label: 'Seeded' },
]

const isElimination = computed(
  () => gameSelectionStore.tournamentFormat == 'elimination'
)

const isRoundRobin = computed(
  () => gameSelectionStore.tournamentFormat == 'round-robin'
)

// Most groups that still leave at least three players in each group.
const maxGroups = computed(() =>
  maxGroupCount(gameSelectionStore.players.length)
)

const isGrouped = computed(
  () => isRoundRobin.value && gameSelectionStore.roundRobinGroups > 1
)

const groupSizeText = computed(() => {
  const sizes = groupSizes(
    gameSelectionStore.players.length,
    gameSelectionStore.roundRobinGroups
  )
  return sizes.every((size) => size == sizes[0])
    ? `${sizes.length} groups of ${sizes[0]}.`
    : `${sizes.length} groups of ${sizes.join(', ')}.`
})

// The order of the player list only matters when the creator picks the
// bracket, or the groups.
const orderMatters = computed(
  () =>
    (isElimination.value || isGrouped.value) &&
    gameSelectionStore.bracketOrder != 'random'
)

// Preview, so it is obvious who will meet whom: the first round of an
// elimination bracket, or the members of each group.
const pairings = computed(() => {
  if (!orderMatters.value) return []
  const players = gameSelectionStore.players
  if (players.length < 2) return []

  const seeded = gameSelectionStore.bracketOrder == 'seeded'
  const label = (id: string | undefined) => {
    if (!id) return undefined
    const index = players.findIndex((p) => p.id == id)
    const name = players[index]?.name ?? id
    return seeded ? `#${index + 1} ${name}` : name
  }

  if (isGrouped.value) {
    const ids: string[] = players.map((p) => p.id)
    return splitIntoGroups(
      seeded ? snakeOrder(ids, gameSelectionStore.roundRobinGroups) : ids,
      gameSelectionStore.roundRobinGroups
    ).map((members, i) => `${groupLabel(i)}: ${members.map(label).join(', ')}`)
  }

  return firstRoundPairings(
    players.map((p) => p.id),
    tournamentTypeFor('elimination', gameSelectionStore.bracketOrder)
  ).map(([a, b]) => {
    const first = label(a)
    const second = label(b)
    return first && second
      ? `${first} vs ${second}`
      : `${first ?? second} (bye)`
  })
})

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

  const groups = isGrouped.value ? gameSelectionStore.roundRobinGroups : 1
  let playerIds = gameSelectionStore.players.map((p) => p.id)
  // The groups are stored as consecutive blocks of the player list. In seeded
  // mode the ranked list is first dealt out snake style.
  if (isGrouped.value && gameSelectionStore.bracketOrder == 'seeded') {
    playerIds = snakeOrder(playerIds, groups)
  }
  // Manual and seeded keep the order of the player list, everything else is
  // drawn at random.
  const keepOrder = orderMatters.value

  await supabase.from('tournaments').insert({
    id: nanoid(),
    type: tournamentTypeFor(
      gameSelectionStore.tournamentFormat,
      gameSelectionStore.bracketOrder,
      groups
    ),
    name: gameSelectionStore.tournamentName,
    userId: usersStore.getCurrentUser.id,
    players: keepOrder ? playerIds : shuffle(playerIds),
    gameType: gameSelectionStore.gameType,
    gameTypeAttributes: gameSelectionStore.gameTypeAttributes,
    legsPerSetArray: gameSelectionStore.legsPerSetArray,
    setsPerMatchArray: gameSelectionStore.setsPerMatchArray,
  })

  router.push({ name: 'tournament-lobby' })
}

const validateLegsPerSetAndSetsPerMatch = () => {
  // Round robin uses the same setting for every match.
  const numRounds =
    gameSelectionStore.tournamentFormat == 'round-robin'
      ? 1
      : tournamentNumberOfRounds(gameSelectionStore.players.length)
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
  [
    () => gameSelectionStore.players.length,
    () => gameSelectionStore.tournamentFormat,
  ],
  () => {
    validateLegsPerSetAndSetsPerMatch()
  }
)

// Fewer players can make the chosen number of groups too high.
watch(maxGroups, (max) => {
  if (gameSelectionStore.roundRobinGroups > max) {
    gameSelectionStore.roundRobinGroups = max
  }
})
</script>
