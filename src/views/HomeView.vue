<template>
  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'stats' })">My Stats</button>
  </div>
  <h2>Select Game Type</h2>
  <div class="row">
    <button
      v-for="(displayName, type) in GameDisplayNames"
      :class="{ selected: type == gameType }"
      @click="selectGameType(type)"
    >
      {{ displayName }}
    </button>
  </div>
  <component
    :is="getOptionsComponent(gameType)"
    @update="typeAttributes = $event"
  ></component>
  <PlayerSelection @update="players = $event"></PlayerSelection>
  <br />
  <button class="selected" :disabled="players.length == 0" @click="onPlay">
    Play
  </button>
  <br />
  <br />
</template>

<script lang="ts" setup>
import ReloadView from '@/components/ReloadView.vue'
import { router } from '@/router'
import { GameType, Leg, GameDisplayNames } from '@/types/game'
import { useUsersStore } from '@/stores/users'
import { nanoid } from 'nanoid'
import { onMounted, ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import X01OptionsInput from '@/components/X01OptionsInput.vue'
import RtcOptionsInput from '@/components/RtcOptionsInput.vue'
import PlayerSelection, {
  UserCurrentInfo,
} from '@/components/PlayerSelection.vue'

const gameStore = useGameStore()
const usersStore = useUsersStore()

const typeAttributes = ref<string[]>([])
const players = ref<UserCurrentInfo[]>([])
const gameType = ref<GameType>('301')

onMounted(() => {
  if (localStorage.getItem('data')) {
    useModalStore().push(ReloadView, {}, {})
  }
})

const getOptionsComponent = (type: GameType) => {
  switch (type) {
    case '301':
    case '501':
    case '701':
      return X01OptionsInput
    case 'Round the Clock':
      return RtcOptionsInput
  }
}

const selectGameType = (type: GameType) => {
  if (gameType.value == type) return
  gameType.value = type
}

const onPlay = () => {
  if (players.value.length == 0) return
  if (!usersStore.getCurrentUser) return
  const gameId = nanoid()

  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    typeAttributes: typeAttributes.value,
    type: gameType.value,
    result: [],
    players: players.value.map((player) => player.id),
    legs: players.value.map(
      (player) =>
        ({
          id: nanoid(),
          userId: player.id,
          visits: [],
          arrows: player.arrows ?? 'unknown',
          confirmed: false,
          gameId: gameId,
          typeAttributes: typeAttributes.value,
          type: gameType.value,
          beers: player.beers ?? null,
          finish: false,
          createdAt: new Date().toISOString(),
        } satisfies Leg)
    ),
  })
  router.push({ name: 'game' })
}
</script>
