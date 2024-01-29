<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>

  <h2>Users</h2>
  <button
    v-for="userId in onlineStore.usersOnline"
    :disabled="userId == useAuthStore().auth?.id"
    @click="
      () => {
        onlineStore.spectating = userId
        router.push({ name: 'spectate' })
      }
    "
  >
    {{ useUsersStore().getUser(userId)?.name }}
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'

const onlineStore = useOnlineStore()
</script>
