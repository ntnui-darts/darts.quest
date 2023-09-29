import { defineStore } from 'pinia';
import { nanoid } from 'nanoid';

export type User = {
  name: string;
  id: string;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
  }),

  actions: {
    addUser() {
      const name = prompt('Name');
      if (name) {
        this.users.push({ name, id: nanoid(12) });
      }
    },
    getUser(userId: string) {
      return this.users.find((user) => user.id == userId);
    },
  },
});
