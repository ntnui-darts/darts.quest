<template>
  <div class="row spaced" style="align-items: center; gap: 2em">
    <small style="max-width: 10%">
      {{ new Date(leg.createdAt).toLocaleString() }}
    </small>
    <p style="flex: 1">
      {{ getGameDisplayName(leg) }} {{ otherPlayersText }}
      <template v-if="game?.tournamentId">{{ tournamentText }}</template>
      <span> ({{ leg.visits.length }} visits)</span>
    </p>
    <button @click="showDetails" style="flex: 0">Details</button>
  </div>
</template>

<script lang="ts" setup>
import { getGameDisplayName } from '@/games/games'
import { useModalStore } from '@/stores/modal'
import { useTournamentStore } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import { DbGame, Leg } from '@/types/game'
import { computed } from 'vue'
import GameSummary from './GameSummary.vue'

const props = defineProps<{
  leg: Leg
  game: DbGame
}>()

const showDetails = () => {
  useModalStore().push(GameSummary, { leg: props.leg, game: props.game }, {})
}

const usersStore = useUsersStore()
const tournamentStore = useTournamentStore()

const otherPlayersText = computed(() => {
  if (!props.game) {
    return false
  }
  const otherPlayers = props.game.players
    .filter((player) => player != props.leg.userId)
    .map((userId) => usersStore.getName(userId))
  if (otherPlayers.length == 0) {
    return ``
  } else if (otherPlayers.length == 1) {
    return `with ${otherPlayers.at(0)}`
  } else if (otherPlayers.length <= 4) {
    return `with ${otherPlayers.slice(0, -1).join(', ')} and ${otherPlayers.at(
      -1
    )}`
  } else {
    return `with ${otherPlayers.length} other players`
  }
})

const tournamentText = computed(() => {
  if (!props.game) {
    return ''
  }
  return `in ${tournamentStore.getTournamentName(
    props.game.tournamentId ?? undefined
  )}`
})
</script>
