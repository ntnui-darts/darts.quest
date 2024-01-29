<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>

  <h2>Users</h2>
  <button
    v-for="userId in useOnlineStore().usersOnline"
    :disabled="userId == useAuthStore().auth?.id"
    @click="router.push({ name: 'home' })"
  >
    {{ useUsersStore().getUser(userId)?.name }}
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useOnlineStore } from '@/stores/online'
import { useUsersStore } from '@/stores/users'
</script>
