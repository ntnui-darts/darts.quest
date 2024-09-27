<template>
  <h2>Select Players</h2>
  <div class="col" v-auto-animate>
    <button
      v-for="user in players"
      :style="{
        opacity: user == draggedUser ? 0.3 : user == hoverUser ? 0.6 : 1,
      }"
      :draggable="true"
      :key="user.id"
      :id="user.id"
      @click="editUser(user)"
      @dragstart="draggedUser = user"
      @dragenter="hoverUser = user"
      @dragend="
        () => {
          draggedUser = null
          hoverUser = null
        }
      "
      @drop="dragUser(draggedUser, user)"
      @dragover.prevent
      @dragenter.prevent
    >
      {{ user.name }}
    </button>
    <div
      v-if="!readonly"
      class="row"
      id="player-selection-buttons"
      key="player-selection-buttons"
    >
      <button style="flex: 1" @click="clearPlayers">Clear Players</button>
      <div style="flex: 1"></div>
      <button style="flex: 1" @click="searchForPlayer">+ Add Player</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import { User, useUsersStore } from '@/stores/users'
import { onMounted, ref, watch } from 'vue'
import PlayerOptions from './PlayerOptions.vue'
import PlayerSearch from './PlayerSearch.vue'

export type UserCurrentInfo = User & {
  arrows?: string
  beers?: number
}

const players = defineModel<UserCurrentInfo[]>('players', { required: true })

defineProps<{ readonly?: boolean }>()

const usersStore = useUsersStore()
const draggedUser = ref<UserCurrentInfo | null>(null)
const hoverUser = ref<UserCurrentInfo | null>(null)

const clearPlayers = () => {
  if (!usersStore.getCurrentUser || players.value.length == 1) {
    players.value.splice(0, players.value.length)
  } else {
    players.value.splice(0, players.value.length)
    players.value.push(usersStore.getCurrentUser)
  }
}

const searchForPlayer = () => {
  useModalStore().push(
    PlayerSearch,
    { selectedUsers: players.value },
    {
      select: (user) => {
        usersStore.recordUserSelection(user.id)
        players.value.push(user)
        useModalStore().pop()
      },
    }
  )
}

const editUser = (user: UserCurrentInfo) => {
  useModalStore().push(
    PlayerOptions,
    { user, leftButtonText: 'Remove' },
    {
      cancel: () => {
        const index = players.value.indexOf(user)
        if (index >= 0) {
          players.value.splice(index, 1)
        }
        useModalStore().pop()
      },
      submit: (data: { beers: number; arrows: string }) => {
        user.arrows = data.arrows
        user.beers = data.beers
        useModalStore().pop()
      },
    }
  )
}

const dragUser = (from: UserCurrentInfo | null, to: UserCurrentInfo) => {
  if (!from) return
  const fromIndex = players.value.indexOf(from)
  const toIndex = players.value.indexOf(to)
  players.value[fromIndex] = to
  players.value[toIndex] = from
  draggedUser.value = null
}

watch(
  () => usersStore.getCurrentUser,
  (user) => {
    if (!user) return
    const player = players.value.find((p) => p.id == user.id)
    if (!player) {
      players.value.push(user)
    } else {
      Object.assign(player, user)
    }
  },
  { immediate: true }
)

onMounted(() => {
  // https://www.npmjs.com/package/mobile-drag-drop#:~:text=If%20you%27re%20targeting%20iOS%20Safari%2010.x%20and%20higher
  window.addEventListener('touchmove', () => {}, { passive: false })
})
</script>
