<template>
  <div>
    <template v-if="tournament">
      <h3>
        {{ tournament.name }}
        {{ new Date(tournament.createdAt).toDateString() }}
        by
        {{ useUsersStore().getName(tournament.userId) }}
      </h3>
    </template>

    <div class="row spaced">
      <h3>
        {{ getGameDisplayName(game) }}
      </h3>
      <h3>
        {{ gameState?.getTopRightText() }}
      </h3>
    </div>
  </div>

  <div v-if="game && !allPlayersFinished" class="col">
    <div
      class="col shadow"
      style="
        background-color: rgb(43, 43, 43);
        border-radius: 0.5em;
        padding: 1em 0;
        margin-bottom: 1.5em;
        overflow: hidden;
        gap: 1.5em;
      "
    >
      <div class="row" style="overflow: auto; padding: 0 1em">
        <button
          v-for="userId in gameState?.playersLeft ?? []"
          :class="{ selected: gameState?.player == userId }"
          :key="userId"
          :id="userId"
          style="min-width: 135px"
          @click="clickUser(userId)"
        >
          {{ usersStore.getName(userId) }}
          <br />
          {{ gameState?.getUserDisplayText(userId) }}
        </button>
      </div>
      <div class="row" style="margin: 0 1em">
        <button
          v-for="(segment, i) in displayVisit.visit"
          :class="{
            outlined:
              (!displayVisit.isPrev && i == displayVisit.visit.indexOf(null)) ||
              (displayVisit.isPrev && i == 0),
          }"
          :disabled="displayVisit.isPrev || segment == null"
        >
          {{ gameController.getSegmentText(segment) }}
        </button>
      </div>
    </div>

    <component
      v-if="showInput"
      :is="getInputComponent(game.type)"
      :game="game"
      :game-state="gameState"
      :game-controller="gameController"
      @hit="emit('hit', $event)"
      @miss="emit('miss')"
      @undo="emit('undo')"
    ></component>
  </div>

  <div v-if="game && somePlayersFinished">
    <button v-if="allPlayersFinished && showInput" @click="emit('undo')">
      &#x232B;
    </button>
    <h2>Results</h2>
    <ol>
      <li
        v-for="(id, i) in gameState?.rank"
        style="display: flex; justify-content: space-between"
      >
        <span> {{ i + 1 }}. {{ gameState?.getUserResultText(id) }} </span>
        <span
          v-if="getEloText && getEloColor"
          style="margin-left: 1em"
          :style="{ color: getEloColor(id) }"
          >{{ getEloText(id) }}</span
        >
      </li>
    </ol>
    <div v-if="showSave" class="col">
      <button @click="emit('save')">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { speak } from '@/functions/speak'
import { getGameDisplayName, getInputComponent } from '@/games/games'
import { useModalStore } from '@/stores/modal'
import { useTournamentStore } from '@/stores/tournament'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameState,
  Segment,
  getLegOfUser,
} from '@/types/game'
import { computed, watch } from 'vue'
import InGameSummary from './InGameSummary.vue'

const props = defineProps<{
  game: Game
  gameState: GameState
  gameController: GameController<GameState>
  showInput: boolean
  showSave: boolean
  getEloText?: (id: string) => string
  getEloColor?: (id: string) => string
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
  save: []
}>()

const usersStore = useUsersStore()

const allPlayersFinished = computed(
  () => (props.game?.legs.length ?? 0) == (props.gameState?.rank.length ?? 0)
)
const somePlayersFinished = computed(
  () => (props.gameState?.rank.length ?? 0) > 0
)
const displayVisit = computed(() => {
  if (!props.game || !props.gameState?.player)
    return { visit: [null, null, null], isPrev: false }
  const leg = getLegOfUser(props.game, props.gameState?.player)
  const visit = leg?.visits.at(-1)
  if ((!visit || visit?.indexOf(null) == -1) && props.gameState?.prevPlayer) {
    const leg = getLegOfUser(props.game, props.gameState?.prevPlayer)
    const visit = leg?.visits.at(-1)
    return { visit: visit ?? [null, null, null], isPrev: true }
  }
  return { visit: visit ?? [null, null, null], isPrev: false }
})
const tournament = computed(() =>
  useTournamentStore().tournaments.find((t) => t.id == props.game.tournamentId)
)

const clickUser = (userId: string) => {
  if (!props.game) return
  const leg = getLegOfUser(props.game, userId)
  const user = usersStore.getUser(userId)
  if (!leg || !user) return
  useModalStore().push(InGameSummary, { leg, user }, {})
}

watch(
  () => props.gameState?.player,
  (userId) => {
    if (userId) {
      const btn = document.getElementById(userId)
      btn?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }
)

watch(
  () => props.gameState?.getTopRightText(),
  (text) => {
    if (text) setTimeout(() => speak(text), 1000)
  },
  { immediate: true }
)
</script>

<style scoped>
.grid-users {
  display: grid;
  column-gap: 1em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr;
}

button {
  flex: 1;
}

li {
  font-size: 14pt;
  padding-bottom: 0.5em;
}
</style>
