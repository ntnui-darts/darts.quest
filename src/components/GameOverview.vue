<template>
  <div class="row spaced">
    <h3>
      {{ getGameDisplayName(game) }}
    </h3>
    <h3>
      {{ gameState?.getTopRightText() }}
    </h3>
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
          {{ usersStore.getUser(userId)?.name ?? 'Unknown' }}
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
      @hit="emit('hit', $event)"
      @miss="emit('miss')"
      @undo="emit('undo')"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { getGameDisplayName, getInputComponent } from '@/games/games'
import { useModalStore } from '@/stores/modal'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameState,
  Segment,
  getLegOfUser,
} from '@/types/game'
import { computed } from 'vue'
import InGameSummary from './InGameSummary.vue'

const props = defineProps<{
  game: Game
  gameState: GameState
  gameController: GameController<GameState>
  showInput: boolean
}>()

const emit = defineEmits<{
  hit: [segment: Segment]
  miss: []
  undo: []
}>()

const usersStore = useUsersStore()

const allPlayersFinished = computed(
  () => (props.game?.legs.length ?? 0) == (props.gameState?.rank.length ?? 0)
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

const clickUser = (userId: string) => {
  if (!props.game) return
  const leg = getLegOfUser(props.game, userId)
  const user = usersStore.getUser(userId)
  if (!leg || !user) return
  useModalStore().push(InGameSummary, { leg, user }, {})
}
</script>
