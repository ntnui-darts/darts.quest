<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>

  <h2>Users</h2>
  <button
    v-for="presence in onlineStore.presences"
    :disabled="presence.userId == useAuthStore().auth?.id"
    @click="
      () => {
        onlineStore.spectating = presence.userId
        router.push({ name: 'spectate' })
      }
    "
  >
    {{ useUsersStore().getUser(presence.userId)?.name }}
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'

const onlineStore = useOnlineStore()
</script>
