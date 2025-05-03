import { GameType } from '@/games/games'
import { getX01VisitScore } from '@/games/x01'
import { Achievement } from '@/types/achievement'
import { Game, getLegOfUser } from '@/types/game'

export const achievements = {
  hit_180: {
    name: 'ONEEEEEEHUUUUNDREDANDEIGHTY!',
    description: 'Hit a 180 visit in a game mode.',
    gameTypes: ['x01', 'cricket', 'skovhugger'] as GameType[],
    initialProgression: 0 as number,
    addProgression(progression: number, game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      if (!leg) return
      const count = leg.visits.filter(
        (visit) => getX01VisitScore(visit) === 180
      ).length
      if (count > 0) {
        return { legId: leg.id, progression: progression + count }
      }
    },
    isAchieved(progression: number) {
      return progression > 0
    },
  } satisfies Achievement<number>,

  play_1_game: {
    name: 'Player',
    description: 'Play 1 game.',
    gameTypes: ['x01', 'cricket', 'skovhugger', 'killer', 'rtc'] as GameType[],
    initialProgression: 0 as number,
    addProgression(progression: number, game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      if (!leg) return
      return { legId: leg.id, progression: progression + 1 }
    },
    isAchieved(progression: number) {
      return progression > 1
    },
  } satisfies Achievement<number>,

  checkout_170: {
    name: 'Going fishing',
    description: 'Checkout 170. No need to emote afterwards.',
    gameTypes: ['x01'] as GameType[],
    initialProgression: 0 as number,
    addProgression(progression: number, game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      const userFinished = game.result.includes(userId)
      if (!leg) return

      const lastVisit = leg.visits.at(-1)
      if (lastVisit == undefined) return

      const lastScoreIs170 = getX01VisitScore(lastVisit) == 170
      const lastDart = lastVisit[2]
      const lastDartIsDouble =
        lastDart && lastDart != 'resigned' && lastDart.multiplier == 2

      if (userFinished && lastScoreIs170 && lastDartIsDouble) {
        return { legId: leg.id, progression: progression + 1 }
      }
    },
    isAchieved(progression: number) {
      return progression > 1
    },
  } satisfies Achievement<number>,

  checkout_all_doubles: {
    name: "Gotta catch 'em all",
    description: 'Checkout on all the doubles.',
    gameTypes: ['x01'] as GameType[],
    initialProgression: [] as number[],
    addProgression(progression: number[], game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      if (!leg) return
      const userFinished = leg.finish
      const lastVisit = leg.visits.at(-1)
      const lastDart = lastVisit?.findLast((s) => s != null)
      if (!lastDart || lastDart == 'resigned') return
      const newDouble = !progression.includes(lastDart.sector)
      if (newDouble && userFinished) {
        return { legId: userId, progression: [...progression, lastDart.sector] }
      }
    },
    isAchieved(progression: number[]) {
      return progression.length >= 20
    },
  } satisfies Achievement<number[]>,
} as const
