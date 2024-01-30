import { supabase } from '@/supabase'
import { Game } from '@/types/game'
import { RealtimeChannel } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'

type OnlinePresence = {
  userId: string
  date: Date
  inGame: boolean
}

export const useOnlineStore = defineStore('online', {
  state: () => ({
    presences: [] as OnlinePresence[],
    spectating: null as string | null,
    spectatingGame: null as Game | null,
    presence: {
      inGame: false,
      date: new Date(),
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
      this.presence = { ...this.presence, ...presence }
      if (!this.presence.userId) return
      await this.room?.track(presence)
    },

    async startSpectating(userId: string) {
      this.spectating = userId
      await this.inChannel?.unsubscribe()
      this.inChannel = supabase
        .channel(`game-${this.spectating}`)
        .on('broadcast', { event: 'game' }, (game) => {
          // @ts-ignore
          this.spectatingGame = game.payload as Game
        })
        .subscribe()
    },

    async stopSpectating() {
      await this.inChannel?.unsubscribe()
      this.inChannel = null
      this.spectating = null
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
      return state.presences.find((p) => p.userId == state.spectating)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineStore, import.meta.hot))
}
