<template style="background-color: ">
  <div class="row spaced" style="align-items: center">
    <p>
      <small>{{ new Date(leg.createdAt).toLocaleString() }}</small>
      <br />
      <span style="display: inline-block; min-width: 10em">{{ getGameDisplayName(leg) }} &emsp;</span>
      <span>{{ leg.visits.length }} visits</span>
      <br /><span>{{ getOtherPlayerText() }}</span>
      <div v-if="game?.tournamentId"> {{ getTournamentText() }}</div>
    </p>
    <button @click="showSummary" style="flex: 0">Summary</button>
  </div>
</template>

<script lang="ts" setup>
import { getGameDisplayName } from '@/games/games'
import { useModalStore } from '@/stores/modal'
import { DbGame, Leg } from '@/types/game'
import DartboardChart from './DartboardChart.vue'
import { useUsersStore } from '@/stores/users'
import { useTournamentStore } from '@/stores/tournament'

const props = defineProps<{
  leg: Leg
  game: DbGame | undefined
}>()

const showSummary = () => {
  useModalStore().push(
    DartboardChart,
    { visits: props.leg.visits, statType: props.leg.type },
    {}
  )
}

const usersStore = useUsersStore()
const tournamentStore = useTournamentStore()

const getOtherPlayerText = () => {
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
}

const getTournamentText = () => {
  if (!props.game) {return ''}
  return `in ${tournamentStore.getTournamentName(props.game.tournamentId ?? undefined)}`
}


</script>
