import { acceptHMRUpdate, defineStore } from 'pinia';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

const signInRedirectUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:5173/#/'
  : 'https://ntnui-darts.github.io/dartpp/#/';

supabase.auth.onAuthStateChange(() => {
  useUserStore().getUser();
});

export const useUserStore = defineStore('user', {
  state: () => ({
    user: undefined as User | undefined,
    name: '',
  }),

  actions: {
    async getUser() {
      const response = await supabase.auth.getSession();
      this.user = response.data.session?.user;
      if (this.user) {
        const name = await supabase
          .from('users')
          .select('name')
          .eq('id', this.user.id);
        if (name.data?.length == 1) {
          this.name = name.data[0].name;
        }
      } else {
        this.name = '';
      }
    },
    async signUp(email: string, password: string) {
      await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: signInRedirectUrl },
      });
      await this.getUser();
    },
    async signIn(email: string, password: string) {
      await supabase.auth.signInWithPassword({ email, password });
      await this.getUser();
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async setName(name: string) {
      if (!this.user) throw Error();
      const prevName = await supabase
        .from('users')
        .select('name')
        .eq('id', this.user.id);
      if (prevName.data?.length == 0) {
        await supabase.from('users').insert({ name });
      } else {
        await supabase.from('users').update({ name });
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
