<template>
  <button id="back" @click="router.push({ name: 'home' })">Home</button>
  <button @click="migrate">Perform Migration</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
// import { fixLegsWithNullVisits } from '@/admin/fix-legs-with-null'

const migrate = () => {
  // fixLegsWithNullVisits()
}
</script>
