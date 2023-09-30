import { acceptHMRUpdate, defineStore } from 'pinia';
import { supabase } from '@/supabase';
import { DbGame, Leg } from './game';
import { useUsersStore } from './users';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    legs: [] as Leg[],
    games: [] as DbGame[],
  }),

  actions: {
    async fetchLegs() {
      const id = useUsersStore().getCurrentUser?.id;
      if (!id) return;
      const legs = await supabase.from('legs').select('*').eq('userId', id);
      if (legs.data) {
        // @ts-ignore
        this.legs = legs.data as Leg;
      }
    },
    async fetchGames() {
      const id = useUsersStore().getCurrentUser?.id;
      if (!id) return;
      const games = await supabase
        .from('games')
        .select('*')
        .contains('players', [id]);
      if (games.data) {
        this.games = games.data;
      }
    },
  },

  getters: {
    getNumberOfWins: (state) => {
      return state.games.filter(
        (game) =>
          game.players.length > 1 &&
          game.result.length > 0 &&
          game.result[0] == useUsersStore().getCurrentUser?.id
      ).length;
    },
    getNumberOfLosses: (state) => {
      return state.games.filter(
        (game) =>
          game.players.length > 1 &&
          game.result.length > 0 &&
          game.result[0] != useUsersStore().getCurrentUser?.id
      ).length;
    },
    getNumberOfSoloGames: (state) => {
      return state.games.filter((game) => game.players.length < 2).length;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot));
}
