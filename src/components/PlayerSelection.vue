<template>
  <h2>Select Players</h2>
  <div class="col" v-auto-animate>
    <button
      v-for="user in selectedUsers"
      :draggable="true"
      :key="user.id"
      :id="user.id"
      @click="editUser(user)"
      @dragenter.prevent="dragUser(draggedUser, user)"
      @dragstart="draggedUser = user"
    >
      {{ user.name }}
    </button>
    <div
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
import { ref, watch, onMounted } from 'vue'
import { User, useUsersStore } from '@/stores/users'
import { useModalStore } from '@/stores/modal'
import PlayerSearch from './PlayerSearch.vue'
import PlayerOptions from './PlayerOptions.vue'

export type UserCurrentInfo = User & {
  arrows?: string
  beers?: number
}

const props = defineProps<{
  players: UserCurrentInfo[]
}>()

const emit = defineEmits<{
  update: [players: UserCurrentInfo[]]
}>()

const usersStore = useUsersStore()

const selectedUsers = ref<UserCurrentInfo[]>(props.players)
const draggedUser = ref<UserCurrentInfo | null>(null)

const clearPlayers = () => {
  selectedUsers.value = []
  emit('update', selectedUsers.value)
}

const searchForPlayer = () => {
  useModalStore().push(
    PlayerSearch,
    { selectedUsers: selectedUsers.value },
    {
      select: (user) => {
        selectedUsers.value.push(user)
        useModalStore().pop()
        emit('update', selectedUsers.value)
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
        const index = selectedUsers.value.indexOf(user)
        if (index >= 0) {
          selectedUsers.value.splice(index, 1)
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
  emit('update', selectedUsers.value)
}

const dragUser = (from: UserCurrentInfo | null, to: UserCurrentInfo) => {
  if (!from) return
  const fromIndex = selectedUsers.value.indexOf(from)
  const toIndex = selectedUsers.value.indexOf(to)
  selectedUsers.value[fromIndex] = to
  selectedUsers.value[toIndex] = from
  emit('update', selectedUsers.value)
}

watch(
  () => usersStore.getCurrentUser,
  (user) => {
    if (user && !selectedUsers.value.find((u) => u.id == user.id)) {
      selectedUsers.value.push(user)
      emit('update', selectedUsers.value)
    }
  },
  { immediate: true }
)

onMounted(() => {
  // https://www.npmjs.com/package/mobile-drag-drop#:~:text=If%20you%27re%20targeting%20iOS%20Safari%2010.x%20and%20higher
  window.addEventListener('touchmove', function () {}, { passive: false })
})
</script>
