import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import { GameType, getMinPlayerCount } from '@/games/games'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useHomeStore = defineStore('home', {
  state: () => ({
    typeAttributes: [] as string[],
    players: [] as UserCurrentInfo[],
    gameType: 'x01' as GameType,
  }),

  actions: {},

  getters: {
    gameReady: (state) => {
      if (state.players.length < getMinPlayerCount(state.gameType)) return false
      return true
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHomeStore, import.meta.hot))
}
