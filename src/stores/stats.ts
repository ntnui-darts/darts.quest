import { acceptHMRUpdate, defineStore } from 'pinia';
import { supabase } from '@/supabase';
import { Leg } from './game';
import { useUsersStore } from './users';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    legs: [] as Leg[],
  }),

  actions: {
    async getLegs() {
      const id = useUsersStore().getCurrentUser?.id;
      if (!id) return;
      const legs = await supabase.from('legs').select('*').eq('userId', id);
      if (legs.data) {
        // @ts-ignore
        this.legs = legs.data as Leg[];
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot));
}
