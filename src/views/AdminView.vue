<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button @click="migrate">Perform Migration</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
// import { migrateScoreOfX01ToTypeAttr } from '@/admin/migration-type-x01'

const migrate = () => {
  // migrateScoreOfX01ToTypeAttr()
}
</script>
