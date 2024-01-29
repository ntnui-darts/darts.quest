import { supabase } from '@/supabase'
import { acceptHMRUpdate, defineStore } from 'pinia'

type OnlinePresence = {
  userId: string
  date: Date
}

export const useOnlineStore = defineStore('online', {
  state: () => {
    const room = supabase.channel('online')

    return {
      room,
      usersOnline: new Set<string>(),
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
            this.usersOnline.add(presence.userId)
          })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          leftPresences.forEach((p) => {
            // @ts-ignore
            const presence = p as OnlinePresence
            this.usersOnline.delete(presence.userId)
          })
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') {
            return
          }

          await this.room.track({
            userId: userId,
            date: new Date(),
          } satisfies OnlinePresence)
        })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnlineStore, import.meta.hot))
}
