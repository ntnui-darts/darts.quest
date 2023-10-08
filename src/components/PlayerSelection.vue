<template>
  <h2>Select Players</h2>
  <div class="col" v-auto-animate>
    <button
      v-for="user in selectedUsers"
      :key="user.id"
      :id="user.id"
      :class="{ selected: true }"
      @click="toggleUser(user)"
    >
      {{ user.name }}
    </button>
  </div>
  <button @click="searchForPlayer">+ Add Player</button>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { User, useUsersStore } from '@/stores/users'
import { useModalStore } from '@/stores/modal'
import PlayerSearch from './PlayerSearch.vue'

export type UserCurrentInfo = User & {
  arrows?: string
  beers?: number
}

const emit = defineEmits<{
  update: [players: UserCurrentInfo[]]
}>()

const usersStore = useUsersStore()

const selectedUsers = ref<UserCurrentInfo[]>([])

const searchForPlayer = () => {
  useModalStore().push(
    PlayerSearch,
    { selectedUsers: selectedUsers.value },
    {
      select: (user) => {
        selectedUsers.value.push(user)
        useModalStore().pop()
      },
    }
  )
}

const toggleUser = (user: UserCurrentInfo) => {
  const index = selectedUsers.value.findIndex((u) => u.id == user.id)
  if (index == -1) {
    selectedUsers.value.push(user)
  } else {
    selectedUsers.value.splice(index, 1)
  }
  emit('update', selectedUsers.value)
}

watch(
  () => usersStore.getCurrentUser,
  (user) => {
    if (user && !selectedUsers.value.find((u) => u.id == user.id)) {
      selectedUsers.value.push(user)
    }
  },
  { immediate: true }
)
</script>
