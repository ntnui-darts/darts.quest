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
          const state = this.room.presenceState()
          // @ts-ignore
          this.presences = Object.values(state).flat()
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
