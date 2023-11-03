<template>
  <div hidden>
    <Youtube
      v-if="gameStore.walkOn"
      :video-id="gameStore.walkOn"
      :start-time="gameStore.walkOnTime"
      :end-time="gameStore.walkOnEndTime"
    >
    </Youtube>
  </div>
  <button
    @click="
      promptQuit('Are you sure that you want to discard the current game?')
    "
  >
    Quit
  </button>
  <h3>{{ getGameDisplayName(gameStore.game) }}</h3>

  <div v-if="gameStore.game && !allPlayersFinished" class="col">
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
          v-for="userId in gameStore.gameState?.playersLeft ?? []"
          :class="{ selected: gameStore.gameState?.player == userId }"
          :key="userId"
          :id="userId"
          style="min-width: 135px"
          @click="clickUser(userId)"
        >
          {{ usersStore.getUser(userId)?.name ?? 'Unknown' }}
          <br />
          {{ gameStore.gameState?.getUserDisplayText(userId) }}
        </button>
      </div>
      <div class="row" style="margin: 0 1em">
        <button
          v-for="(segment, i) in displayVisit"
          :class="{
            outlined:
              i == displayVisit.indexOf(null) ||
              (displayVisit.indexOf(null) == -1 && i == 0),
          }"
          :disabled="displayVisit.indexOf(null) == -1 || segment == null"
        >
          {{ gameStore.getController().getSegmentText(segment) }}
        </button>
      </div>
    </div>
    <component
      :is="getInputComponent(gameStore.game.type)"
      @hit="gameStore.getController().recordHit($event)"
      @miss="gameStore.getController().recordMiss()"
      @undo="gameStore.undoScore()"
    ></component>
  </div>
  <div v-if="gameStore.game && somePlayersFinished">
    <button v-if="allPlayersFinished" @click="gameStore.undoScore()">
      &#x232B;
    </button>
    <h2>Results</h2>
    <ol>
      <li v-for="id in gameStore.gameState?.rank">
        {{ gameStore.gameState?.getUserResultText(id) }}
      </li>
    </ol>
    <div class="col">
      <button @click="saveGame">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Youtube from '@/components/Youtube.vue'
import Prompt from '@/components/Prompt.vue'
import InGameSummary from '@/components/InGameSummary.vue'
import { onMounted, computed, watch } from 'vue'
import { router } from '@/router'
import { useUsersStore } from '@/stores/users'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import { getGameDisplayName, getInputComponent } from '@/games/games'
import { getLegOfUser } from '@/types/game'

const gameStore = useGameStore()
const usersStore = useUsersStore()
const loadingStore = useLoadingStore()

const allPlayersFinished = computed(
  () =>
    (gameStore.game?.legs.length ?? 0) ==
    (gameStore.gameState?.rank.length ?? 0)
)

const somePlayersFinished = computed(
  () => (gameStore.gameState?.rank.length ?? 0) > 0
)

const displayVisit = computed(() => {
  if (!gameStore.game || !gameStore.gameState?.player) return [null, null, null]
  const leg = getLegOfUser(gameStore.game, gameStore.gameState?.player)
  const visit = leg?.visits.at(-1)
  if (
    (!visit || visit?.indexOf(null) == -1) &&
    gameStore.gameState?.prevPlayer
  ) {
    const leg = getLegOfUser(gameStore.game, gameStore.gameState?.prevPlayer)
    const visit = leg?.visits.at(-1)
    return visit ?? [null, null, null]
  }
  return visit ?? [null, null, null]
})

onMounted(() => {
  if (!gameStore.game) {
    quit()
  }
})

const quit = () => {
  localStorage.removeItem('data')
  router.push('/')
}

const promptQuit = (prompt: string, yesFunc?: () => void) => {
  useModalStore().push(
    Prompt,
    {
      text: prompt,
      buttons: [
        { text: 'No', onClick: () => useModalStore().pop() },
        {
          text: 'Yes',
          onClick: () => {
            if (yesFunc) {
              yesFunc()
            } else {
              quit()
            }
            useModalStore().pop()
          },
        },
      ],
    },
    {}
  )
}

const saveGame = async () => {
  promptQuit('Save game and exit?', async () => {
    if (loadingStore.loading) return
    loadingStore.loading = true
    await gameStore.saveGame()
    loadingStore.loading = false
    quit()
  })
}

const clickUser = (userId: string) => {
  if (!gameStore.game) return
  const leg = getLegOfUser(gameStore.game, userId)
  const user = usersStore.getUser(userId)
  if (!leg || !user) return
  useModalStore().push(InGameSummary, { leg, user }, {})
}

watch(
  () => gameStore.gameState?.player,
  (userId) => {
    if (userId) {
      const btn = document.getElementById(userId)
      btn?.scrollIntoView({ behavior: 'smooth' })
    }
  }
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

.outlined {
  outline: 1px solid var(--c-green);
}

li {
  font-size: 14pt;
  padding-bottom: 0.5em;
}
</style>
