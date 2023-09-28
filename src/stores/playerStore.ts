import { defineStore } from 'pinia';
import { nanoid } from 'nanoid';

export type Player = {
  name: string;
  id: string;
};

export const usePlayerStore = defineStore('player', {
  state: () => ({
    players: [] as Player[],
  }),

  actions: {
    addPlayer() {
      const name = prompt('Name');
      if (name) {
        this.players.push({ name, id: nanoid(12) });
      }
    },
    getPlayer(playerId: string) {
      return this.players.find((player) => player.id == playerId);
    },
  },
});
