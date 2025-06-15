<template>
  <div>
    <template v-if="tournament">
      <h3>
        {{ tournament.name }}
        {{ new Date(tournament.createdAt).toDateString() }}
        by
        {{ usersStore.getName(tournament.userId) }}
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
          <span>
            {{ usersStore.getName(userId) }} ({{
              eloStore.getDisplayElo(userId, game.type)
            }})
          </span>
          <div
            style="
              position: relative;
              margin: auto;
              margin-top: 0.45em;
              width: min-content;
            "
          >
            <span style="font-size: xx-large; line-height: 0.8">{{
              gameState?.getUserDisplayText(userId)
            }}</span>
            <span
              v-if="userOnNine(game, userId)"
              style="
                position: absolute;
                left: -2.2em;
                padding: 0.1em 0.5em;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(45deg, #5500ff, #ff0000);

                box-shadow: -0.17em 0.17em 0px 0em rgba(0, 0, 0, 1);
                border-radius: 0.4em;
                font-weight: bold;
                font-size: large;
                color: #dddddd;
              "
              >9</span
            >
          </div>
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

  <div style="display: flex; justify-content: center">
    <button
      v-if="!showInput && prevPlayerIsPlayingOnThisDevice"
      @click="emit('undo')"
      style="width: 40%; justify-content: center"
    >
      &#x232B;
    </button>
  </div>

  <div v-if="game && somePlayersFinished">
    <button v-if="allPlayersFinished && showInput" @click="emit('undo')">
      &#x232B;
    </button>
    <h2>Results</h2>
    <table
      v-if="gameState"
      style="
        width: 100%;
        max-width: 100%;
        font-size: large;
        padding: 1em;
        padding-right: 0;
      "
    >
      <tr
        v-for="(userId, i) in [
          ...gameState.result,
          ...gameState.resignees.reverse(),
        ]"
      >
        <td
          style="
            text-align: left;
            word-break: break-all;
            overflow-wrap: break-word;
          "
        >
          {{ getDisplayPlacementNumber(i) }}.
          {{ gameState?.getUserResultText(userId) }}
        </td>
        <td style="text-align: right">
          {{ eloStore.getDisplayElo(userId, game.type) }}
        </td>
        <td
          style="text-align: right; padding-left: 0.4em"
          v-if="getEloChange"
          :style="{ color: getEloChange(userId).color }"
        >
          {{ getEloChange(userId).text }}
        </td>
      </tr>
    </table>
    <div v-if="showSave" class="col">
      <button @click="emit('save')">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { speak } from '@/functions/speak'
import { getGameDisplayName, getInputComponent } from '@/games/games'
import { userOnNine } from '@/games/x01'
import { useAuthStore } from '@/stores/auth'
import { useEloStore } from '@/stores/elo'
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
import { useOnlineStore } from '@/stores/online'

const props = defineProps<{
  game: Game
  gameState: GameState
  gameController: GameController<GameState>
  showInput: boolean
  showSave: boolean
  getEloChange?: (id: string) => { text: string; color: string }
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
  save: []
}>()

const usersStore = useUsersStore()
const eloStore = useEloStore()

const allPlayersFinished = computed(
  () => (props.game?.legs.length ?? 0) == (props.gameState?.result.length ?? 0)
)
const somePlayersFinished = computed(() =>
  props.gameState
    ? props.gameState.result.length + props.gameState.resignees.length > 0
    : false
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
const prevPlayerIsPlayingOnThisDevice = computed(() => {
  const prevPlayer = props.gameState.prevPlayer
  if (!prevPlayer) return false
  const authId = useAuthStore().auth?.id
  const presence = useOnlineStore().presence

  if (presence.spectating) {
    return prevPlayer == authId
  }
  return prevPlayer == authId || !presence.remotePlayers?.includes(prevPlayer)
})

const getDisplayPlacementNumber = (i: number): number => {
  if (props.game.type == 'killer') {
    return i + props.gameState.playersLeft.length + 1
  }
  return i + 1
}

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
  () => props.game.players,
  (players) => {
    if (!players) return
    players.forEach(async (player) => {
      await eloStore.fetchElo(player, props.game.type)
    })
  },
  { immediate: true }
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
