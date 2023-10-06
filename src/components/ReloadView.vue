<template>
  <h4>
    There is a game loaded in your local storage. Would you like to reload it?
  </h4>
  <button @click="reloadGame()">Reload</button
  ><button @click="clearLocalStorage()">Clear</button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { Game } from '@/stores/game'
import { useGameStoreRoundDaClock } from '@/stores/game-round-da-clock'
import { useGameStoreX01 } from '@/stores/game-x01'
import { useModalStore } from '@/stores/modal'

function reloadGame() {
  const gameJson = localStorage.getItem('data')
  if (!gameJson) return
  const game = JSON.parse(gameJson) as Game

  const store =
    game.type == 'Round the Clock'
      ? useGameStoreRoundDaClock()
      : useGameStoreX01()
  store.setCurrentGame(game)
  router.push(
    game.type == 'Round the Clock'
      ? { name: 'game-round-da-clock' }
      : { name: 'game-x01' }
  )
  useModalStore().pop()
}

function clearLocalStorage() {
  localStorage.clear()
}
</script>

<style scoped></style>
