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
    :get-elo-text="getEloText"
    :get-elo-color="getEloColor"
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
import { roundToNDecimals } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const gameStore = useGameStore()
const loadingStore = useLoadingStore()
const onlineStore = useOnlineStore()
const authStore = useAuthStore()

const eloDeltas = ref<{ userId: string; eloDelta: number }[]>([])

const spectators = computed(() =>
  onlineStore.presences.filter((p) => p.spectating == authStore.auth?.id)
)

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
  () => [
    gameStore.gameState?.rank.length,
    gameStore.gameState?.resignees.length,
  ],
  async () => {
    if (!gameStore.game) return
    eloDeltas.value = await useEloStore().updateEloFromGame(
      gameStore.game,
      false,
      gameStore.gameState
    )
  }
)

const getEloText = (userId: string) => {
  const eloDelta =
    eloDeltas.value.find((eloDelta) => eloDelta.userId == userId)?.eloDelta ?? 0
  return `${eloDelta > 0 ? '+' : ''}${roundToNDecimals(eloDelta, 1)}`
}

const getEloColor = (userId: string) => {
  const eloDelta =
    eloDeltas.value.find((eloDelta) => eloDelta.userId == userId)?.eloDelta ?? 0
  return eloDelta == 0
    ? 'gray'
    : eloDelta > 0
    ? 'var(--c-green)'
    : 'var(--c-red)'
}
</script>
