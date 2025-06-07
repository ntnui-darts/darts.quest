<template>
  <h4>
    The game has reached the maximum number of visits. The listed players should
    now play closest-to-bull. Arrange them by distance to bullseye in ascending
    order.
  </h4>

  <div class="col" v-auto-animate>
    <button
      v-for="userId in remainingPlayers"
      :style="{
        opacity:
          userId == draggedUserId ? 0.3 : userId == hoverUserId ? 0.6 : 1,
      }"
      :draggable="true"
      @dragstart="draggedUserId = userId"
      @dragenter="hoverUserId = userId"
      @dragend="
        () => {
          draggedUserId = null
          hoverUserId = null
        }
      "
      @drop="dragUser(draggedUserId, userId)"
      @dragover.prevent
      @dragenter.prevent
    >
      {{ usersStore.getName(userId) }}
    </button>
  </div>
  <div class="button-row" style="display: flex; gap: 1rem">
    <button @click="confirmRanking()" style="flex: 1">Confirm</button>
    <button @click="emit('undo')" style="flex: 1">&#x232B;</button>
  </div>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import { Game, GameState, getLegOfUser, Visit } from '@/types/game'
import { ref } from 'vue'

const emit = defineEmits<{
  undo: []
}>()
const props = defineProps<{ game: Game; gameState: GameState }>()
const remainingPlayers = [...props.gameState.playersLeft]

const usersStore = useUsersStore()
let draggedUserId = ref<string | null>(null)
let hoverUserId = ref<string | null>(null)

const dragUser = (from: string | null, to: string | null) => {
  if (!from || !to) return
  const fromIndex = remainingPlayers.indexOf(from)
  const toIndex = remainingPlayers.indexOf(to)
  remainingPlayers[fromIndex] = to
  remainingPlayers[toIndex] = from
  draggedUserId.value = null
}

const confirmRanking = () => {
  for (const player of remainingPlayers) {
    const leg = getLegOfUser(props.game, player)
    if (!leg) continue

    const placement = remainingPlayers.indexOf(player)

    const newVisit: Visit = [
      { reason: 'MaxVisit', value: placement },
      null,
      null,
    ]

    leg.visits.push(newVisit)
  }
  useGameStore().refreshGameState()
}
</script>
