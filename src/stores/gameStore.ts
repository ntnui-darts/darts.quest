import { acceptHMRUpdate, defineStore } from 'pinia';

enum Multiplier {
  None,
  Single,
  Double,
  Triple,
}

type Segment = {
  multiplier: Multiplier;
  sector: number;
};

type Visit = [Segment | null, Segment | null, Segment | null];

export const GameTypes = {
  301: 301,
  501: 501,
  701: 701,
} as const;

export type GameType = keyof typeof GameTypes;

type Leg = {
  visits: Visit[];
  arrows: string;
  playerId: string;
};

type Game = {
  legs: Leg[];
  type: GameType;
};

export const useGameStore = defineStore('game', {
  state: () => ({
    currentPlayerId: null as string | null,
    currentGame: null as Game | null,
  }),

  actions: {
    setCurrentGame(game: Game) {
      this.currentGame = game;
      if (this.currentGame.legs.length == 0) throw Error();
      this.currentPlayerId = this.currentGame.legs[0].playerId;
    },
    saveScore(segment: Segment) {
      if (!this.currentPlayerId || !this.currentGame) throw Error();
      this.prepareNewSegment();
      const visit = this.getCurrentVisit;
      if (!visit) throw Error();
      const index = visit.indexOf(null);
      visit[index] = segment;
      if (index == 2) {
        this.nextPlayer();
      }
    },
    undoScore() {
      if (!this.currentPlayerId) throw Error();
      if (this.getCurrentVisit?.every((s) => s == null)) {
        this.getCurrentLeg?.visits.pop();
        this.prevPlayer();
      }
      const visit = this.getCurrentVisit;
      if (!visit) throw Error();
      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null;
          return;
        }
      }
    },
    prepareNewSegment() {
      if (!this.currentGame) throw Error();
      const leg = this.getCurrentLeg;
      if (!leg) throw Error();
      if (leg.visits.length == 0 || leg.visits.at(-1)?.[2] != null) {
        leg.visits.push([null, null, null]);
      }
    },
    nextPlayer() {
      if (!this.currentGame?.legs.length) throw Error();
      if (!this.currentPlayerId) {
        this.currentPlayerId = this.currentGame?.legs[0].playerId ?? null;
        return;
      }
      const index = this.currentGame.legs.findIndex(
        (leg) => leg.playerId == this.currentPlayerId
      );
      if (index == -1) throw Error();
      const nextPlayer = this.currentGame.legs.at(
        (index + 1) % this.currentGame.legs.length
      )?.playerId;
      if (nextPlayer) {
        this.currentPlayerId = nextPlayer;
        this.prepareNewSegment();
      }
    },
    prevPlayer() {
      if (!this.currentGame?.legs.length) throw Error();
      if (!this.currentPlayerId) {
        this.currentPlayerId = this.currentGame?.legs[0].playerId ?? null;
        return;
      }
      const index = this.currentGame.legs.findIndex(
        (leg) => leg.playerId == this.currentPlayerId
      );
      const nextPlayer = this.currentGame.legs.at(
        (index - 1) % this.currentGame.legs.length
      )?.playerId;
      if (nextPlayer) {
        this.currentPlayerId = nextPlayer;
      }
    },
    getPlayerLeg(playerId: string) {
      if (!this.currentGame) throw Error();
      return (
        this.currentGame?.legs.find((leg) => leg.playerId == playerId) ?? null
      );
    },
  },

  getters: {
    getCurrentVisit(state): Visit | null {
      if (!state.currentPlayerId) throw Error();
      return this.getCurrentLeg?.visits.at(-1) ?? null;
    },
    getCurrentLeg: (state) => {
      if (!state.currentGame || !state.currentPlayerId) throw Error();
      return (
        state.currentGame.legs.find(
          (leg) => leg.playerId == state.currentPlayerId
        ) ?? null
      );
    },
    getPlayerIds: (state) => {
      return state.currentGame?.legs.map((l) => l.playerId) ?? [];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}

export const multiplierToString = (m?: Multiplier) => {
  return m ? 'I'.repeat(m) : '-';
};

export const getLegScore = (
  leg: Leg | null,
  gameType: GameType,
  includeUnfinished = true
) => {
  let score = 0;
  leg?.visits.forEach((v) => {
    const visitScore = getVisitScore(v, includeUnfinished);
    if (score + visitScore <= gameType) {
      score += visitScore;
    }
  });
  return score;
};

export const getAvgLegScore = (leg: Leg | null, gameType: GameType) => {
  const count = leg?.visits.filter((visit) => !visit.includes(null)).length;
  if (!count) return 0;
  return getLegScore(leg, gameType, false) / count;
};

const getVisitScore = (visit: Visit, includeUnfinished = true) => {
  if (!includeUnfinished && visit.includes(null)) return 0;
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0);
};

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0;
};
