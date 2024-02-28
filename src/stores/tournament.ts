import { compareCreatedAt } from '@/functions/compare'
import { GameType } from '@/games/games'
import { supabase } from '@/supabase'
import { Database } from '@/types/supabase'
import { Prettify } from '@/types/ts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'

export type DbTournament = Database['public']['Tables']['tournaments']['Row']
export type Tournament = Prettify<
  Omit<DbTournament, 'gameType'> & {
    gameType: GameType
  }
>

export const useTournamentStore = defineStore('tournament', {
  state: () => ({
    currentTournament: null as Tournament | null,
    tournaments: [] as Tournament[],
  }),

  actions: {
    fetchTournament(id: string) {
      this.currentTournament = null
    },
    async fetchTournaments() {
      const id = useAuthStore().auth?.id
      if (!id) return
      const tournaments = await supabase
        .from('tournaments')
        .select('*')
        .contains('players', [id])
      if (tournaments.data) {
        this.tournaments = tournaments.data.toSorted(
          compareCreatedAt
        ) as Tournament[]
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTournamentStore, import.meta.hot))
}
