import { supabase } from '@/supabase'
import { Game } from '@/types/game'
import { RealtimeChannel } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'

type OnlinePresence = {
  userId: string
  date: Date
  inGame: boolean
  spectating: string | null
}

export const useOnlineStore = defineStore('online', {
  state: () => ({
    presences: [] as OnlinePresence[],
    spectatingGame: null as Game | null,
    presence: {
      inGame: false,
      date: new Date(),
      spectating: null,
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

      this.outChannel = supabase.channel(`game-${userId}`).subscribe()
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
        .on('broadcast', { event: 'game' }, (game) => {
          // @ts-ignore
          this.spectatingGame = game.payload as Game
        })
        .subscribe()
    },

    async stopSpectating() {
      await this.inChannel?.unsubscribe()
      await this.sendUpdate({ spectating: null })
      this.inChannel = null
      this.spectatingGame = null
    },

    sendGame(game: Game) {
      this.outChannel?.send({
        type: 'broadcast',
        event: 'game',
        payload: game,
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
