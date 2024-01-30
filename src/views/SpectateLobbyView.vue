<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>

  <h2>Users</h2>
  <button
    v-for="presence in onlineStore.presences"
    :disabled="presence.userId == useAuthStore().auth?.id"
    @click="spectate(presence.userId)"
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

const spectate = async (userId: string) => {
  await onlineStore.startSpectating(userId)
  router.push({ name: 'spectate' })
}
</script>
