<template>
  <div class="row">
    <button @click="router.push({ name: 'user' })">My Profile</button>
    <button @click="router.push({ name: 'stats' })">My Stats</button>
  </div>
  <br />
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
  <h4 style="margin: 0">
    {{
      // TODO: get from controller.
      gameType == 'Round the Clock' || gameType == 'rtc-random'
        ? 'Mode'
        : 'Finish'
    }}
  </h4>
  <div class="row">
    <button
      v-for="t in ([1, 2, 3] as const)"
      :class="{ selected: t == mode }"
      @click="mode = t"
    >
      {{ ['Single', 'Double', 'Triple'][t - 1] }}
    </button>
  </div>
  <h2>Select Players</h2>
  <div v-auto-animate class="col">
    <button
      v-for="user in usersStore.users"
      :key="user.id"
      :id="user.id"
      :class="{ selected: selectedUsers.has(user.id) }"
      @click="toggleUser(user)"
    >
      {{ user.name }}
    </button>
  </div>
  <br />
  <br />
  <button :disabled="selectedUsers.size == 0" @click="onPlay">Play</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { GameType, Leg, GameDisplayNames } from '@/types/game'
import { useUsersStore, User } from '@/stores/users'
import { nanoid } from 'nanoid'
import { onMounted, ref, watch } from 'vue'
import { useModalStore } from '@/stores/modal'
import ReloadView from '@/components/ReloadView.vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const usersStore = useUsersStore()

const selectedUsers = ref(new Set<string>())
const gameType = ref<GameType>('301')
const mode = ref<1 | 2 | 3>(2)

onMounted(() => {
  if (localStorage.getItem('data')) {
    useModalStore().push(ReloadView, {}, {})
  }
})

watch(
  () => usersStore.getCurrentUser,
  (user) => {
    if (user) {
      selectedUsers.value.add(user.id)
    }
  },
  { immediate: true }
)

const toggleUser = (user: User) => {
  if (selectedUsers.value.has(user.id)) {
    selectedUsers.value.delete(user.id)
  } else {
    selectedUsers.value.add(user.id)
  }
}

const selectGameType = (type: GameType) => {
  if (gameType.value == type) return
  gameType.value = type
  // Set default mode based on gameType
  // TODO: get from controller.
  if (gameType.value == 'Round the Clock' || gameType.value == 'rtc-random') {
    mode.value = 1
  } else {
    mode.value = 2
  }
}

const onPlay = () => {
  if (selectedUsers.value.size == 0) return
  if (!usersStore.getCurrentUser) return
  const gameId = nanoid()
  const players = Array.from(selectedUsers.value)
  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    type: gameType.value,
    finishType: mode.value,
    result: [],
    players,
    legs: players.map(
      (userId) =>
        ({
          id: nanoid(),
          userId,
          visits: [],
          arrows: 'unknown',
          confirmed: false,
          gameId: gameId,
          type: gameType.value,
          finishType: mode.value,
          beers: null,
          finish: false,
          createdAt: new Date().toISOString(),
        } satisfies Leg)
    ),
  })
  router.push({ name: 'game' })
}
</script>
