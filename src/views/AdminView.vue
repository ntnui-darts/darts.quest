<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button @click="migrateTypeToArray">Type Array Migration</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { migrateTypeToArray } from '@/admin/migration-type-array'
</script>
