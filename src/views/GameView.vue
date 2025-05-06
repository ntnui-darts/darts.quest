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
  <button
    v-if="gameStore.game && gameStore.game.type === 'x01' && finishType === 2"
    @click="showCheckoutCard"
  >
    Checkout Card
  </button>

  <MainGame
    v-if="gameStore.game && gameStore.gameState"
    :show-input="
      !onlineStore.presence.remotePlayers?.find(
        (p) => p == gameStore.gameState?.player
      )
    "
    :show-save="true"
    :game="gameStore.game"
    :game-state="gameStore.gameState"
    :game-controller="gameStore.getController()"
    :get-elo-change="getEloChange"
    @hit="gameStore.getController().recordHit($event)"
    @miss="gameStore.getController().recordMiss()"
    @undo="gameStore.undoScore()"
    @save="saveGame"
  ></MainGame>

  <template v-if="spectators.length > 0">
    <h3>Spectators</h3>
    <ul>
      <li v-for="presence in spectators">
        {{ useUsersStore().getName(presence.userId) }}
      </li>
    </ul>
  </template>

  <button
    v-if="gameStore.game && ['x01', 'rtc'].includes(gameStore.game.type)"
    @click="recordResign"
  >
    Resign
  </button>
</template>

<script lang="ts" setup>
import CheckoutCard from '@/components/CheckoutCard.vue'
import MainGame from '@/components/MainGame.vue'
import Prompt from '@/components/Prompt.vue'
import Youtube from '@/components/Youtube.vue'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useEloStore } from '@/stores/elo'
import { useGameStore } from '@/stores/game'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { useOnlineStore } from '@/stores/online'
import { useOptionsStore } from '@/stores/options'
import { useUsersStore } from '@/stores/users'
import { getTypeAttribute } from '@/types/game'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const gameStore = useGameStore()
const loadingStore = useLoadingStore()
const onlineStore = useOnlineStore()
const authStore = useAuthStore()
const eloStore = useEloStore()

const eloDeltas = ref<{ userId: string; eloDelta: number }[]>([])

const spectators = computed(() =>
  onlineStore.presences.filter((p) => p.spectating == authStore.auth?.id)
)

const finishType: number = gameStore.game
  ? getTypeAttribute(gameStore.game, 'finish', 1)
  : 1

onMounted(async () => {
  if (!gameStore.game) {
    quit()
  }
  await onlineStore.sendUpdate({
    inGame: true,
  })
})

onUnmounted(async () => {
  await onlineStore.sendUpdate({
    inGame: false,
  })
})

const quit = () => {
  localStorage.removeItem('game')
  if (gameStore.game?.tournamentId) {
    router.push({ name: 'tournament' })
  } else {
    router.push('/')
  }
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

const recordResign = () => {
  useModalStore().push(
    Prompt,
    {
      text: 'Are you sure that you want to resign?',
      buttons: [
        { text: 'No', onClick: () => useModalStore().pop() },
        {
          text: 'Yes',
          onClick: () => {
            gameStore.getController().recordResign()
            useModalStore().pop()
          },
        },
      ],
    },
    {}
  )
}

const saveGame = async () => {
  promptQuit('Save game and exit?', tryToSave)
}

const tryToSave = async () => {
  if (loadingStore.loading) return
  loadingStore.loading = true
  let saved = false
  try {
    saved = await gameStore.saveGame()
  } catch (err) {
    saved = false
    if (err instanceof Error && err.message == '409') {
      quit()
    }
  }
  loadingStore.loading = false
  if (saved) {
    quit()
  } else {
    promptQuit(
      'Something went wrong, likely an internet issue. Try again?',
      tryToSave
    )
  }
}
watch(
  () => [
    gameStore.gameState?.result.length,
    gameStore.gameState?.resignees.length,
  ],
  async (now, prev) => {
    if (!gameStore.game) return
    if (now[0] == prev[0] && now[1] == prev[1]) return

    eloDeltas.value = await eloStore.updateEloFromGame(
      gameStore.game,
      false,
      gameStore.gameState
    )
  }
)

watch(
  () => gameStore.game?.players,
  (players) => {
    if (!players) return
    players.forEach(async (player) => {
      if (!gameStore.game) return
      await eloStore.fetchElo(player, gameStore.game.type)
    })
  },
  { immediate: true }
)

const getEloChange = (userId: string) => {
  const eloDelta =
    eloDeltas.value.find((eloDelta) => eloDelta.userId == userId)?.eloDelta ?? 0
  const text = `${eloDelta > 0 ? '+' : ''}${Math.round(eloDelta)}`
  const color =
    eloDelta == 0 ? 'gray' : eloDelta > 0 ? 'var(--c-green)' : 'var(--c-red)'
  return { text, color }
}

const showCheckoutCard = () => {
  if (!gameStore.game) return
  useModalStore().push(CheckoutCard, {}, {})
}
</script>
