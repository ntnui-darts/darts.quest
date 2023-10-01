import { supabase } from '@/supabase';
import { Database } from '@/types/supabase';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { useStatsStore } from './stats';

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

export type Visit = [Segment | null, Segment | null, Segment | null];

export const GameTypes = {
  '301': 301,
  '501': 501,
  '701': 701,
} as const;

export type GameType = keyof typeof GameTypes;

export type DbLeg = Database['public']['Tables']['legs']['Row'];
export type Leg = Omit<DbLeg, 'visits' | 'createdAt'> & {
  visits: Visit[];
  createdAt: string;
};

export type DbGame = Database['public']['Tables']['games']['Row'];
export type Game = Omit<DbGame, 'createdAt' | 'legs'> & {
  createdAt?: string;
  legs: Leg[];
  type: GameType;
  finishType: 1 | 2 | 3;
};

export const useGameStore = defineStore('game', {
  state: () => ({
    currentUserId: null as string | null,
    currentGame: null as Game | null,
  }),

  actions: {
    setCurrentGame(game: Game) {
      this.currentGame = game;
      if (this.currentGame.legs.length == 0) throw Error();
      this.currentUserId = this.currentGame.legs[0].userId;
      this.addVisitIfNecessary();
    },
    saveScore(segment: Segment) {
      if (!this.currentUserId || !this.currentGame || !this.getCurrentLeg)
        throw Error();
      if (this.currentGame.result.includes(this.currentUserId)) return;
      this.addVisitIfNecessary();
      const visit = this.getCurrentVisit;
      if (!visit) throw Error();
      const index = visit.indexOf(null);
      visit[index] = segment;

      if (
        getLegScore(
          this.getCurrentLeg,
          this.currentGame.type,
          this.currentGame.finishType
        ) == GameTypes[this.currentGame.type]
      ) {
        this.currentGame.result.push(this.currentUserId);
        this.getCurrentLeg.finish = true;
        this.nextUser();
      } else if (index == 2) {
        this.nextUser();
      }
    },
    undoScore() {
      if (!this.currentUserId || !this.getCurrentLeg) throw Error();
      if (this.getCurrentVisit?.every((s) => s == null)) {
        this.getCurrentLeg.visits.pop();
        this.prevUser();
      }
      const visit = this.getCurrentVisit;
      if (!visit) {
        this.addVisitIfNecessary();
        return;
      }
      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null;
          return;
        }
      }
    },
    addVisitIfNecessary() {
      if (!this.currentGame) throw Error();
      const leg = this.getCurrentLeg;
      if (!leg) throw Error();
      if (
        getLegScore(leg, this.currentGame.type, this.currentGame.finishType) ==
        GameTypes[this.currentGame.type]
      ) {
        return;
      }
      if (leg.visits.length == 0 || leg.visits.at(-1)?.[2] != null) {
        leg.visits.push([null, null, null]);
      }
    },
    nextUser() {
      if (!this.currentGame?.legs.length) throw Error();
      if (!this.currentUserId) {
        this.currentUserId = this.currentGame?.legs[0].userId ?? null;
        return;
      }
      if (this.currentGame.result.length == this.currentGame.legs.length) {
        return;
      }
      const index = this.currentGame.legs.findIndex(
        (leg) => leg.userId == this.currentUserId
      );
      if (index == -1) throw Error();
      const nextUser = this.currentGame.legs.at(
        (index + 1) % this.currentGame.legs.length
      )?.userId;
      if (nextUser) {
        this.currentUserId = nextUser;
        this.addVisitIfNecessary();
      }
      if (this.currentGame.result.includes(this.currentUserId)) {
        this.nextUser();
      }
    },
    prevUser() {
      if (!this.currentGame?.legs.length) throw Error();
      if (!this.currentUserId) {
        this.currentUserId = this.currentGame?.legs[0].userId ?? null;
        return;
      }
      const index = this.currentGame.legs.findIndex(
        (leg) => leg.userId == this.currentUserId
      );
      const nextUser = this.currentGame.legs.at(
        (index - 1) % this.currentGame.legs.length
      )?.userId;
      if (nextUser) {
        this.currentUserId = nextUser;
      }
    },
    getUserLeg(userId: string) {
      if (!this.currentGame) throw Error();
      return this.currentGame?.legs.find((leg) => leg.userId == userId) ?? null;
    },
    async saveGame() {
      if (!this.currentGame) throw Error();
      for (let leg of this.currentGame.legs) {
        await supabase
          .from('legs')
          .insert({ ...leg, type: leg.type.toString() });
      }
      await supabase.from('games').insert({
        ...this.currentGame,
        legs: this.currentGame.legs.map((leg) => leg.id),
        type: this.currentGame.type.toString(),
      });
      useStatsStore().fetchLegs();
      useStatsStore().fetchGames();
    },
  },

  getters: {
    getCurrentVisit(): Visit | null {
      if (!this.currentUserId) return null;
      return this.getCurrentLeg?.visits.at(-1) ?? null;
    },
    getNumberOfThrows(): number | null {
      return this.getCurrentVisit?.findIndex((s) => s == null) ?? null;
    },
    getCurrentLeg: (state) => {
      if (!state.currentGame || !state.currentUserId) return null;
      return (
        state.currentGame.legs.find(
          (leg) => leg.userId == state.currentUserId
        ) ?? null
      );
    },
    getUserIds: (state) => {
      return state.currentGame?.legs.map((l) => l.userId) ?? [];
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
  finishType: 1 | 2 | 3,
  includeUnfinished = true
) => {
  let score = 0;
  leg?.visits.forEach((v) => {
    const visitScore = getVisitScore(v, includeUnfinished);
    if (score + visitScore == GameTypes[gameType]) {
      if (
        finishType == 1 ||
        (v.findLast((s) => s != null)?.multiplier ?? 0) == finishType
      ) {
        score += visitScore;
      }
    } else if (score + visitScore < GameTypes[gameType]) {
      const rest = GameTypes[gameType] - score - visitScore;
      if (rest >= finishType) {
        score += visitScore;
      }
    }
  });
  return score;
};

export const getAvgLegScore = (
  leg: Leg | null,
  gameType: GameType,
  finishType: 1 | 2 | 3,
  includeUnfinished = false
) => {
  const count = includeUnfinished
    ? leg?.visits.length
    : leg?.visits.filter((visit) => !visit.includes(null)).length;
  if (!count) return 0;
  return getLegScore(leg, gameType, finishType, includeUnfinished) / count;
};

const getVisitScore = (visit: Visit, includeUnfinished = true) => {
  if (!includeUnfinished && visit.includes(null)) return 0;
  return visit.reduce((prev, current) => prev + getSegmentScore(current), 0);
};

const getSegmentScore = (segment: Segment | null) => {
  return segment ? segment.multiplier * segment.sector : 0;
};
