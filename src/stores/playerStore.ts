import { acceptHMRUpdate, defineStore } from 'pinia';

enum Multiplier {
  None,
  Single,
  Double,
  Triple,
}

export const multiplierToString = (m?: Multiplier) => {
  return m ? 'I'.repeat(m) : '-';
};

type Segment = {
  multiplier: Multiplier;
  sector: number;
};

type Visit = [Segment | null, Segment | null, Segment | null];

type LegStatus = 'complete' | 'in progress';

type Leg = {
  visits: Visit[];
  arrows: string;
  status: LegStatus;
};

type Player = {
  name: string;
  legs: Leg[];
};

export const getLegScore = (player: Player, currentMax: number) => {
  const visits = player.legs.at(0)?.visits;
  if (!visits) return 0;

  let score = 0;
  visits.forEach((v) => {
    const visitScore = getVisitScore(v);
    if (score + visitScore <= currentMax) {
      score += visitScore;
    }
  });

  return score;
};

export const getAvgLegScore = (player: Player, currentMax: number) => {
  const count = player.legs
    .at(0)
    ?.visits.flat()
    .filter((s) => s != null).length;
  if (!count) return 0;
  return getLegScore(player, currentMax) / count;
};

const getVisitScore = (visit: Visit) => {
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0);
};

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0;
};

export const usePlayerStore = defineStore('player', {
  state: () => ({
    players: [] as Player[],
    currentPlayer: null as Player | null,
    currentMax: 501,
  }),

  actions: {
    addPlayer() {
      const name = prompt('Name');
      const player = { name: name || 'Unknown', legs: [] };
      this.players.push(player);
      if (this.currentPlayer == null) {
        this.currentPlayer = this.players[0];
      }
    },
    saveScore(segment: Segment) {
      if (this.players.length == 0) return;
      if (!this.currentPlayer) {
        this.currentPlayer = this.players[0];
      }
      if (
        this.currentPlayer.legs.length == 0 ||
        this.currentPlayer.legs.at(-1)?.status == 'complete'
      ) {
        this.currentPlayer.legs.push({
          visits: [],
          arrows: 'unknown',
          status: 'in progress',
        });
      }
      this.newVisit();
      const visit = this.currentPlayer.legs.at(-1)?.visits.at(-1);
      if (!visit) throw Error();
      const index = visit.indexOf(null);
      visit[index] = segment;
      if (index == 2) {
        this.nextPlayer();
      }
    },
    undoScore() {
      if (!this.currentPlayer) return;
      if (this.getCurrentVisit.every((s) => s == null)) {
        this.currentPlayer.legs.at(-1)?.visits.pop();
        this.prevPlayer();
      }
      const visit = this.getCurrentVisit;
      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null;
          return;
        }
      }
    },
    newVisit() {
      if (!this.currentPlayer) return;
      const leg = this.currentPlayer.legs.at(-1);
      if (!leg) throw Error();
      if (leg.visits.length == 0 || leg.visits.at(-1)?.[2] != null) {
        leg.visits.push([null, null, null]);
      }
    },
    nextPlayer() {
      if (this.players.length == 0) return;
      if (!this.currentPlayer) {
        this.currentPlayer = this.players[0];
        return;
      }
      const index = this.players.indexOf(this.currentPlayer);
      const nextPlayer = this.players.at((index + 1) % this.players.length);
      if (nextPlayer) {
        this.currentPlayer = nextPlayer;
        this.newVisit();
      }
    },
    prevPlayer() {
      if (this.players.length == 0) return;
      if (!this.currentPlayer) {
        this.currentPlayer = this.players[0];
        return;
      }
      const index = this.players.indexOf(this.currentPlayer);
      const nextPlayer = this.players.at((index - 1) % this.players.length);
      if (nextPlayer) {
        this.currentPlayer = nextPlayer;
      }
    },
  },

  getters: {
    getCurrentVisit: (state) => {
      if (!state.currentPlayer) return [null, null, null];
      return (
        state.currentPlayer.legs.at(-1)?.visits.at(-1) ?? [null, null, null]
      );
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot));
}
