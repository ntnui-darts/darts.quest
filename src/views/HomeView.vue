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
  <component
    :is="getOptionsInput(gameType)"
    @update="typeAttributes = $event"
  ></component>
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
import ReloadView from '@/components/ReloadView.vue'
import { router } from '@/router'
import { GameType, Leg, GameDisplayNames } from '@/types/game'
import { useUsersStore, User } from '@/stores/users'
import { nanoid } from 'nanoid'
import { onMounted, ref, watch } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'
import X01OptionsInput from '@/components/X01OptionsInput.vue'
import RtcOptionsInput from '@/components/RtcOptionsInput.vue'

const gameStore = useGameStore()
const usersStore = useUsersStore()

const typeAttributes = ref<string[]>([])
const selectedUsers = ref(new Set<string>())
const gameType = ref<GameType>('301')

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

const getOptionsInput = (type: GameType) => {
  switch (type) {
    case '301':
    case '501':
    case '701':
      return X01OptionsInput
    case 'Round the Clock':
      return RtcOptionsInput
  }
}

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
}

const onPlay = () => {
  if (selectedUsers.value.size == 0) return
  if (!usersStore.getCurrentUser) return
  const gameId = nanoid()
  const players = Array.from(selectedUsers.value)
  gameStore.setCurrentGame({
    id: gameId,
    userId: usersStore.getCurrentUser.id,
    typeAttributes: typeAttributes.value,
    type: gameType.value,
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
          typeAttributes: typeAttributes.value,
          type: gameType.value,
          beers: null,
          finish: false,
          createdAt: new Date().toISOString(),
        } satisfies Leg)
    ),
  })
  router.push({ name: 'game' })
}
</script>
