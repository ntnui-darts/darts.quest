<template>
  <h2>Select Players</h2>
  <div class="col" v-auto-animate>
    <button
      v-for="user in selectedUsers"
      :key="user.id"
      :id="user.id"
      class="selected"
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
import PlayerOptions from './PlayerOptions.vue'

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
        emit('update', selectedUsers.value)
      },
    }
  )
}

const toggleUser = (user: UserCurrentInfo) => {
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
</script>
