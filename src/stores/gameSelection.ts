import { UserCurrentInfo } from '@/components/PlayerSelection.vue'
import { GameType, getMinPlayerCount } from '@/games/games'
import { router } from '@/router'
import { Leg } from '@/types/game'
import { nanoid } from 'nanoid'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useGameStore } from './game'
import { useOnlineStore } from './online'
import { useUsersStore } from './users'

export const useGameSelectionStore = defineStore('game-selection', {
  state: () => ({
    gameType: 'x01' as GameType,
    gameTypeAttributes: [] as string[],
    players: [] as UserCurrentInfo[],

    // Create tournament
    setsPerMatchArray: [1],
    legsPerSetArray: [1],
    tournamentName: 'Casual Tournament',
  }),

  actions: {
    play(options: {
      tournamentId?: string
      players?: UserCurrentInfo[]
      gameType?: GameType
      gameTypeAttributes?: string[]
    }) {
      const usersStore = useUsersStore()
      const gameType = options.gameType ?? this.gameType
      const gameTypeAttributes =
        options.gameTypeAttributes ?? this.gameTypeAttributes
      const players = options.players ?? this.players

      if (players.length == 0) return
      if (!this.gameType) return
      if (!usersStore.getCurrentUser) return

      useOnlineStore().presence.remotePlayers = players
        .filter((p) => p.allowRemote)
        .map((p) => p.id)

      const gameId = nanoid()
      useGameStore().setCurrentGame({
        id: gameId,
        userId: usersStore.getCurrentUser.id,
        typeAttributes: gameTypeAttributes,
        type: gameType,
        result: [],
        players: players.map((player) => player.id),
        legs: players.map(
          (player) =>
            ({
              id: nanoid(),
              userId: player.id,
              visits: [],
              arrows: player.arrows ?? 'unknown',
              confirmed: false,
              gameId: gameId,
              typeAttributes: this.gameTypeAttributes,
              type: this.gameType,
              beers: player.beers ?? null,
              finish: false,
              createdAt: new Date().toISOString(),
            } satisfies Leg)
        ),
        tournamentId: options.tournamentId,
      })
      router.push({ name: 'game' })
    },
  },

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
