import { acceptHMRUpdate, defineStore } from 'pinia';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import { useUsersStore } from './users';

const signInRedirectUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:5173/#/'
  : 'https://ntnui-darts.github.io/dartpp/#/';

supabase.auth.onAuthStateChange(() => {
  useAuthStore().getSession();
});

export const useAuthStore = defineStore('user', {
  state: () => ({
    auth: undefined as AuthUser | undefined,
  }),

  actions: {
    async getSession() {
      const response = await supabase.auth.getSession();
      this.auth = response.data.session?.user;
    },
    async signUp(email: string, password: string) {
      await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: signInRedirectUrl },
      });
      useUsersStore().fetchUsers();
      await this.getSession();
    },
    async signIn(email: string, password: string) {
      await supabase.auth.signInWithPassword({ email, password });
      await this.getSession();
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
        useUsersStore().fetchUsers();
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
