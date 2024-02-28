<template>
  <button id="back" @click="router.push({ name: 'tournament-lobby' })">
    Back
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
</script>
