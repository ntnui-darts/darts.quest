import { achievements } from '@/achievements/achievements'
import { GameType } from '@/games/games'
import { Prettify } from '@/types/ts'
import { Game } from './game'
import { Database } from './supabase'

export type Achievement<T> = {
  name: string
  description: string
  gameTypes: GameType[]
  initialProgression: T
  addProgression(
    progression: T,
    game: Game,
    userId: string
  ): { legId: string | null; progression: T } | undefined
  isAchieved(progression: T): boolean
}

export type AchievementId = keyof typeof achievements

export type DbAchievement = Database['public']['Tables']['achievements']['Row']

export type UserAchievement<T extends AchievementId> = Omit<
  DbAchievement,
  'achievedAt'
> & {
  achievementId: T
  userId: string
  achievedAt: string | null
  progression: (typeof achievements)[T]['initialProgression']
  legIds: string[]
}

export const newUserAchievement = <T extends AchievementId>(
  achievementId: T,
  userId: string
): Prettify<UserAchievement<T>> => {
  const achievement = achievements[achievementId]
  return {
    achievementId,
    userId,
    achievedAt: null,
    progression: structuredClone(achievement.initialProgression),
    legIds: [],
  }
}
