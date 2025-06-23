<template>
  <div class="row spaced" style="align-items: center">
    <small>
      {{ new Date(leg.createdAt).toLocaleString() }}
    </small>
    <br />
    <span style="display: inline-block; min-width: 10em"
      >{{ getGameDisplayName(leg) }} &emsp;</span
    >
    <span>{{ leg.visits.length }} visits</span>
    <br />
    <span>{{ otherPlayersText }}</span>
    <div v-if="game?.tournamentId">{{ tournamentText }}</div>
    <button @click="showSummary" style="flex: 0">Summary</button>
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

const showSummary = () => {
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
