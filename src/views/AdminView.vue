<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button @click="migrate">Perform Migration</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
// import { migrateRenameRtc } from '@/admin/migration-rtc-rename'

export const migrate = () => {
  // migrateRenameRtc()
}
</script>
