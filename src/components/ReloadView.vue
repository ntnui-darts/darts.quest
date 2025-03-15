<template>
  <h4>
    There is a game saved in your local storage. Would you like to load it?
  </h4>
  <button @click="reloadGame()">Load</button
  ><button @click="clearData()">Clear</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useGameStore } from '@/stores/game'
import { useModalStore } from '@/stores/modal'
import { GameExtended } from '@/types/game'

function reloadGame() {
  const gameJson = localStorage.getItem('game')
  if (!gameJson) return
  const game = JSON.parse(gameJson) as GameExtended

  useGameStore().setCurrentGame(game)
  router.push({ name: 'game' })
  useModalStore().pop()
}

function clearData() {
  localStorage.removeItem('game')
  useModalStore().pop()
}
</script>

<style scoped></style>
