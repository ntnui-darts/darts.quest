import { getX01VisitScore } from '@/games/x01'
import { AchievementTracker } from '@/types/achievement'
import { Game, getLegOfUser } from '@/types/game'

export const getHit180AchievementTracker = (): AchievementTracker => {
  return {
    achievementId: 'hit_180',
    checkCondition(game: Game, userId: string) {
      const leg = getLegOfUser(game, userId)
      const visits = leg ? leg.visits : []

      const achieved = visits.find((visit) => getX01VisitScore(visit) === 180)
        ? true
        : false
      return { leg: leg ? leg.id : null, achieved }
    },
  }
}
