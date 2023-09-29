import { supabase } from '@/supabase';
import { Database } from '@/types/supabase';
import { acceptHMRUpdate, defineStore } from 'pinia';

export type User = Database['public']['Tables']['users']['Row'];

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
  }),

  actions: {
    async fetchUsers() {
      const fetchedUsers = (await supabase.from('users').select('*')).data;
      if (fetchedUsers) {
        this.users = fetchedUsers;
      }
    },
    getUser(id?: string) {
      return this.users.find((user) => user.id == id);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
