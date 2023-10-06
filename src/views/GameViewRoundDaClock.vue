<template>
  <button @click="quit">Quit</button>
  <div v-if="gameStore.currentGame && !allPlayersFinished" class="col">
    <div class="grid-users" style="grid-template-columns: 1fr 1fr">
      <button
        v-for="userId in gameStore.getUserIds.filter(
          (id) => !gameStore.currentGame?.result.includes(id)
        )"
        :class="{ selected: gameStore.currentUserId == userId }"
        @click="showChart(userId)"
      >
        {{ usersStore.getUser(userId)?.name ?? 'Unknown' }}
        <br />
        {{ getLegScore(gameStore.getUserLeg(userId)?.visits ?? []) + 1 }}
      </button>
    </div>
    <div class="row">
      <button
        v-for="(segment, i) in gameStore.getCurrentVisit"
        :class="{ outlined: i == gameStore.getNumberOfThrows }"
      >
        {{ segment?.sector ?? '-' }}
      </button>
    </div>
    <div class="row scoringbutton">
      <button
        @click="
          gameStore.saveScore({
            multiplier: 1,
            sector: 0,
          })
        "
      >
        &#10799;
      </button>
      <button
        @click="
          gameStore.saveScore({
            multiplier: 1,
            sector: gameStore.getCurrentSector,
          })
        "
      >
        &#10003;
      </button>
    </div>
    <button @click="gameStore.undoScore">&#10226;</button>
  </div>
  <div v-if="gameStore.currentGame && somePlayersFinished">
    <h2>Results, {{ gameStore.currentGame.type }}</h2>
    <ol>
      <li v-for="id in gameStore.currentGame.result">
        {{ usersStore.getUser(id)?.name ?? 'Unknown' }},
        {{
          gameStore.currentGame.legs.find((leg) => leg.userId == id)?.visits
            .length
        }}
        turns
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
import DartboardChart from '@/components/DartboardChart.vue'
import {
  useGameStoreRoundDaClock,
  getLegScore,
} from '@/stores/game-round-da-clock'

const gameStore = useGameStoreRoundDaClock()
const usersStore = useUsersStore()
const loadingStore = useLoadingStore()

const allPlayersFinished = computed(
  () =>
    (gameStore.currentGame?.legs.length ?? 0) ==
    (gameStore.currentGame?.result.length ?? 0)
)

const somePlayersFinished = computed(
  () => (gameStore.currentGame?.result.length ?? 0) > 0
)

onMounted(() => {
  if (!gameStore.currentGame) {
    quit()
  }
})

const quit = () => {
  localStorage.clear()
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

.grid-sectors {
  display: grid;
  column-gap: 0.5em;
  row-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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

.scoringbutton {
  height: 12em;
}
</style>
