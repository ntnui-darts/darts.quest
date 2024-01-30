<template>
  <div hidden>
    <Youtube
      v-if="gameStore.walkOn && !useOptionsStore().walkOnMuted"
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

  <GameOverview
    v-if="gameStore.game && gameStore.gameState"
    :show-input="true"
    :game="gameStore.game"
    :game-state="gameStore.gameState"
    :game-controller="gameStore.getController()"
    @hit="gameStore.getController().recordHit($event)"
    @miss="gameStore.getController().recordMiss()"
    @undo="gameStore.undoScore()"
  ></GameOverview>

  <div v-if="gameStore.game && somePlayersFinished">
    <button v-if="allPlayersFinished" @click="gameStore.undoScore()">
      &#x232B;
    </button>
    <h2>Results</h2>
    <ol>
      <li
        v-for="(id, i) in gameStore.gameState?.rank"
        style="display: flex; justify-content: space-between"
      >
        <span>
          {{ i + 1 }}. {{ gameStore.gameState?.getUserResultText(id) }}
        </span>
        <span style="margin-left: 1em" :style="{ color: getEloColor(id) }">{{
          getEloText(id)
        }}</span>
      </li>
    </ol>
    <div class="col">
      <button @click="saveGame">Save Game</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import GameOverview from '@/components/GameOverview.vue'
import Prompt from '@/components/Prompt.vue'
import Youtube from '@/components/Youtube.vue'
import { speak } from '@/functions/speak'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useEloStore } from '@/stores/elo'
import { useGameStore } from '@/stores/game'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { useOnlineStore } from '@/stores/online'
import { useOptionsStore } from '@/stores/options'
import { roundToNDecimals } from '@/stores/stats'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const gameStore = useGameStore()
const loadingStore = useLoadingStore()
const onlineStore = useOnlineStore()
const authStore = useAuthStore()

const eloDeltas = ref<{ userId: string; eloDelta: number }[]>([])

const allPlayersFinished = computed(
  () =>
    (gameStore.game?.legs.length ?? 0) ==
    (gameStore.gameState?.rank.length ?? 0)
)

const somePlayersFinished = computed(
  () => (gameStore.gameState?.rank.length ?? 0) > 0
)

onMounted(async () => {
  if (!gameStore.game) {
    quit()
  }
  await onlineStore.sendUpdate({
    inGame: true,
    userId: authStore.auth?.id,
    date: new Date(),
  })
})

onUnmounted(async () => {
  await onlineStore.sendUpdate({
    inGame: false,
    userId: authStore.auth?.id,
    date: new Date(),
  })
})

const quit = () => {
  localStorage.removeItem('game')
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
    let saved = false
    try {
      saved = await gameStore.saveGame()
    } catch {
      saved = false
    }
    if (saved) {
      loadingStore.loading = false
      quit()
    } else {
      alert(
        'Something went wrong! Please submit an issue to NTNUI Darts on GitHub.'
      )
    }
  })
}

watch(
  () => gameStore.gameState?.player,
  (userId) => {
    if (userId) {
      const btn = document.getElementById(userId)
      btn?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }
)

watch(
  () => gameStore.gameState?.getTopRightText(),
  (text) => {
    if (text) setTimeout(() => speak(text), 1000)
  },
  { immediate: true }
)

watch(
  () => gameStore.gameState?.rank.length,
  async () => {
    if (!gameStore.game?.result.length) return
    eloDeltas.value = await useEloStore().updateEloFromGame(
      gameStore.game,
      false
    )
  }
)

const getEloText = (userId: string) => {
  if ((gameStore.game?.result.length ?? 0) < 2) return ''
  const eloDelta =
    eloDeltas.value.find((eloDelta) => eloDelta.userId == userId)?.eloDelta ?? 0
  return `${eloDelta > 0 ? '+' : ''}${roundToNDecimals(eloDelta, 1)}`
}

const getEloColor = (userId: string) => {
  const eloDelta =
    eloDeltas.value.find((eloDelta) => eloDelta.userId == userId)?.eloDelta ?? 0
  return eloDelta > 0 ? '#127a16' : '#ad1717'
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
