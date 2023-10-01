import { acceptHMRUpdate, defineStore } from 'pinia';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import { useUsersStore } from './users';
import { useStatsStore } from './stats';

supabase.auth.onAuthStateChange(async (_, session) => {
  const user = session?.user;
  useAuthStore().auth = user;
  if (user) {
    useUsersStore().fetchUsers();
    useStatsStore().fetchLegs();
    useStatsStore().fetchGames();
  }
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: undefined as AuthUser | undefined,
  }),

  actions: {
    async getSession() {
      const response = await supabase.auth.getSession();
      this.auth = response.data.session?.user;
    },
    async signUp(name: string, email: string, password: string) {
      await supabase.auth.signUp({ email, password });
      await this.setName(name);
    },
    async signIn(email: string, password: string) {
      await supabase.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async setName(name: string) {
      if (!this.auth) throw Error();
      const prevName = await supabase
        .from('users')
        .select('name')
        .eq('id', this.auth.id);
      if (prevName.data?.length == 0) {
        await supabase.from('users').insert({ name });
      } else {
        await supabase.from('users').update({ name }).eq('id', this.auth.id);
        await useUsersStore().fetchUsers();
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
