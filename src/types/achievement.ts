import { Database } from './supabase'
import { Game } from './game'
import { GameType } from '@/games/games'
import { nanoid } from 'nanoid'

export type AchievementId = 'hit_180'

export type DbAchievement = Database['public']['Tables']['achievement']['Row']
export type Achievement = Omit<DbAchievement, 'id' | 'includedGameTypes'> & {
  id: AchievementId
  includedGameTypes: GameType[]
}

export type DbUserAchievement =
  Database['public']['Tables']['user_achievement']['Row']
export type UserAchievement = Omit<
  DbUserAchievement,
  'achievement' | 'createdAt'
> & {
  achievement: AchievementId
}

export interface AchievementTracker {
  achievementId: AchievementId
  checkCondition(
    game: Game,
    userId: string
  ): { leg: string | null; achieved: boolean }
}

export const newUserAchievement = (
  achievement: AchievementId,
  userId: string
): UserAchievement => {
  return {
    id: nanoid(),
    achievement: achievement,
    leg: null,
    unlocked: false,
    unlockedTime: new Date().toISOString(),
    user: userId,
  }
}
