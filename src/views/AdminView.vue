<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button @click="migrate">Perform Migration</button>
</template>

<script lang="ts" setup>
// import  { migrateToStatisticsPerLeg } from '@/admin/migration-statistics-per-leg'
import { router } from '@/router'
// import  { setElo } from '@/admin/set-elo'

const migrate = () => {
  // setElo()
}
</script>
