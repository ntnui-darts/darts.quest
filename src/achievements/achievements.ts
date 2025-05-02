import { GameType } from '@/games/games'
import { getX01VisitScore } from '@/games/x01'
import { Achievement } from '@/types/achievement'
import { Game, getLegOfUser } from '@/types/game'

export const achievements = {
  hit_180: {
    name: 'ONEEEEEEHUUUUNDREDANDEIGTHY!',
    description: 'Hit a 180 visit in a game mode.',
    gameTypes: ['x01', 'cricket', 'skovhugger'] as GameType[],
    initialProgression: 0 as number,
    addProgression(progression: number, game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      if (!leg) return { legId: null, progression }
      const count = leg.visits.filter(
        (visit) => getX01VisitScore(visit) === 180
      ).length
      if (count > 0) {
        return { legId: leg.id, progression: progression + count }
      } else {
        return { legId: null, progression }
      }
    },
    isAchieved(progression: number) {
      return progression > 0
    },
  },

  play_1_game: {
    name: 'Player',
    description: 'Play 1 game.',
    gameTypes: ['x01', 'cricket', 'skovhugger', 'killer', 'rtc'] as GameType[],
    initialProgression: 0 as number,
    addProgression(progression: number, game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      if (!leg) return { legId: null, progression }
      return { legId: leg.id, progression: progression + 1 }
    },
    isAchieved(progression: number) {
      return progression > 1
    },
  },
} as const satisfies Record<string, Achievement<unknown>>
