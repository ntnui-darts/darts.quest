import { supabase } from '@/supabase'
import { acceptHMRUpdate, defineStore } from 'pinia'

type OnlinePresence = {
  userId: string
  date: Date
  inGame: boolean
}

export const useOnlineStore = defineStore('online', {
  state: () => {
    const room = supabase.channel('online')

    return {
      room,
      presences: [] as OnlinePresence[],
      spectating: null as string | null,
      presence: {} as Partial<OnlinePresence>,
    }
  },

  actions: {
    initRoom(userId: string) {
      this.room
        .on('presence', { event: 'sync' }, () => {
          // hmm?
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          newPresences.forEach((p) => {
            // @ts-ignore
            const presence = p as OnlinePresence
            this.presences = this.presences.filter(
              (p) => p.userId != presence.userId
            )
            this.presences.push(presence)
          })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          leftPresences.forEach((p) => {
            // @ts-ignore
            const presence = p as OnlinePresence
            this.presences = this.presences.filter(
              (p) => p.userId != presence.userId
            )
            if (presence.userId == this.spectating) {
              this.spectating = null
            }
          })
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') {
            return
          }

          this.sendUpdate({ userId })
        })
    },

    async sendUpdate(presence: Partial<OnlinePresence>) {
      this.presence = { ...this.presence, ...presence }
      if (!this.presence.userId) return
      await this.room.track(this.presence)
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
