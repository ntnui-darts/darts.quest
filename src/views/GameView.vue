<template>
  <button @click="quit">Quit</button>
  <div v-if="gameStore.game && !allPlayersFinished" class="col">
    <div class="grid-users" style="grid-template-columns: 1fr 1fr">
      <button
        v-for="userId in gameStore.getUserIds.filter(
          (id) => !gameStore.game?.result.includes(id)
        )"
        :class="{ selected: gameStore.userId == userId }"
        @click="showChart(userId)"
      >
        {{ usersStore.getUser(userId)?.name ?? 'Unknown' }}
        <br />
        {{ gameStore.getController().getUserDisplayText(userId) }}
      </button>
    </div>
    <div class="row">
      <button
        v-for="(segment, i) in gameStore.getCurrentVisit"
        :class="{ outlined: i == gameStore.getNumberOfThrows }"
      >
        {{ gameStore.getController().getSegmentText(segment) }}
      </button>
    </div>
    <component
      :is="gameStore.getInputComponent()"
      @hit="gameStore.getController().recordHit($event)"
      @miss="gameStore.getController().recordMiss"
      @undo="gameStore.undoScore"
    ></component>
  </div>
  <div v-if="gameStore.game && somePlayersFinished">
    <h2>Results, {{ gameStore.game.type }}</h2>
    <ol>
      <li v-for="id in gameStore.game.result">
        {{ gameStore.getController().getUserResultText(id) }}
      </li>
    </ol>
    <div class="col">
      <button @click="saveGame">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { router } from '@/router'
import { useUsersStore } from '@/stores/users'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import DartboardChart from '@/components/DartboardChart.vue'

const gameStore = useGameStore()
const usersStore = useUsersStore()
const loadingStore = useLoadingStore()

const allPlayersFinished = computed(
  () =>
    (gameStore.game?.legs.length ?? 0) == (gameStore.game?.result.length ?? 0)
)

const somePlayersFinished = computed(
  () => (gameStore.game?.result.length ?? 0) > 0
)

onMounted(() => {
  if (!gameStore.game) {
    quit()
  }
})

const quit = () => {
  localStorage.removeItem('data')
  router.push('/')
}

const saveGame = async () => {
  if (loadingStore.loading) return
  loadingStore.loading = true
  await gameStore.saveGame()
  loadingStore.loading = false
  quit()
}

const showChart = (userId: string) => {
  const leg = gameStore.getUserLeg(userId)
  if (!leg) return
  useModalStore().push(DartboardChart, { visits: leg.visits }, {})
}
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

.outlined {
  outline: 1px solid var(--c-green);
}

li {
  font-size: 14pt;
  padding-bottom: 0.5em;
}
</style>
