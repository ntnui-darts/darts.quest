<template>
  <h4>
    There is a game saved in your local storage. Would you like to load it?
  </h4>
  <button @click="reloadGame()">Load</button
  ><button @click="clearData()">Clear</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { Game } from '@/types/game'
import { useModalStore } from '@/stores/modal'
import { useGameStore } from '@/stores/game'

function reloadGame() {
  const gameJson = localStorage.getItem('data')
  if (!gameJson) return
  const game = JSON.parse(gameJson) as Game

  useGameStore().setCurrentGame(game)
  router.push({ name: 'game' })
  useModalStore().pop()
}

function clearData() {
  localStorage.removeItem('data')
  useModalStore().pop()
}
</script>

<style scoped></style>
