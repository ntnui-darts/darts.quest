import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import { GameType, getMinPlayerCount } from '@/games/games'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useGameSelectionStore = defineStore('game-selection', {
  state: () => ({
    gameType: 'x01' as GameType,
    gameTypeAttributes: [] as string[],
    players: [] as UserCurrentInfo[],
    setsPerMatch: 1,
    legsPerSet: 1,
  }),

  actions: {},

  getters: {
    gameReady: (state) => {
      if (state.players.length < getMinPlayerCount(state.gameType)) return false
      return true
    },
    tournamentReady() {
      if (!this.gameReady) return false
      if (this.players.length < 2) return false
      return true
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useGameSelectionStore, import.meta.hot)
  )
}
