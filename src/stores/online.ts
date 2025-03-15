import { supabase } from '@/supabase'
import { GameExtended, Segment } from '@/types/game'
import { RealtimeChannel } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useGameStore } from './game'

type OnlinePresence = {
  userId: string
  date: Date
  inGame: boolean
  spectating: string | null
  remotePlayers: string[]
}

export const useOnlineStore = defineStore('online', {
  state: () => ({
    presences: [] as OnlinePresence[],
    spectatingGame: null as GameExtended | null,
    presence: {
      inGame: false,
      date: new Date(),
      spectating: null,
      remotePlayers: [],
    } as Partial<OnlinePresence>,
    room: null as RealtimeChannel | null,
    inChannel: null as RealtimeChannel | null,
    outChannel: null as RealtimeChannel | null,
  }),

  actions: {
    async initRoom(userId: string) {
      await supabase.removeAllChannels()

      this.room = supabase.channel('online')
      this.room
        .on('presence', { event: 'sync' }, () => {
          const state = this.room?.presenceState()
          // @ts-ignore
          this.presences = Object.values(state).flat()
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return
          this.sendUpdate({ userId })
        })

      this.outChannel = supabase
        .channel(`game-${userId}`)
        .on('broadcast', { event: 'input' }, (args) => {
          const gameStore = useGameStore()
          const player = gameStore.gameState?.player
          if (!player || args.payload.userId != player) return
          if (!this.presence.remotePlayers?.includes(player)) return

          const gameController = gameStore.getController()
          switch (args.payload.type) {
            case 'hit':
              gameController.recordHit(args.payload.segment)
              break
            case 'miss':
              gameController.recordMiss()
              break
            case 'undo':
              gameStore.undoScore()
              break
          }
        })
        .on('broadcast', { event: 'refresh' }, () => {
          this.sendGame()
        })
        .subscribe()
    },

    async sendUpdate(presence: Partial<OnlinePresence>) {
      this.presence = {
        ...this.presence,
        userId: useAuthStore().auth?.id,
        date: new Date(),
        ...presence,
      }
      if (!this.presence.userId) return
      await this.room?.track(this.presence)
    },

    async startSpectating(userId: string) {
      await this.sendUpdate({ spectating: userId })
      await this.inChannel?.unsubscribe()
      this.inChannel = supabase
        .channel(`game-${this.presence.spectating}`)
        .on('broadcast', { event: 'game' }, (args) => {
          this.spectatingGame = args.payload as GameExtended
        })
        .subscribe((status) => {
          if (status != 'SUBSCRIBED') return
          this.inChannel?.send({
            type: 'broadcast',
            event: 'refresh',
          })
        })
    },

    async stopSpectating() {
      await this.inChannel?.unsubscribe()
      await this.sendUpdate({ spectating: null })
      this.inChannel = null
      this.spectatingGame = null
    },

    sendGame() {
      const game = useGameStore().game
      if (!game) return
      this.outChannel?.send({
        type: 'broadcast',
        event: 'game',
        payload: game,
      })
    },

    sendInput(type: 'hit' | 'miss' | 'undo', segment?: Segment) {
      this.inChannel?.send({
        type: 'broadcast',
        event: 'input',
        payload: {
          userId: useAuthStore().auth?.id,
          type,
          segment,
        },
      })
    },
  },

  getters: {
    getSpectating: (state) => {
      return state.presences.find((p) => p.userId == state.presence.spectating)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineStore, import.meta.hot))
}
