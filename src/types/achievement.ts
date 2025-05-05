import { achievements } from '@/achievements/achievements'
import { GameType } from '@/games/games'
import { Prettify } from '@/types/ts'
import { Game } from './game'
import { Database } from './supabase'

export type Achievement<TProgression> = {
  name: string
  description(progression?: TProgression): string
  gameTypes: GameType[]
  initialProgression: TProgression
  addProgression(
    progression: TProgression,
    game: Game,
    userId: string
  ): { legId: string | null; progression: TProgression } | undefined
  isAchieved(progression: TProgression): boolean
}
export type AchievementId = keyof typeof achievements
export type DbAchievement = Database['public']['Tables']['achievements']['Row']

export type UserAchievement<TId extends AchievementId> = Omit<
  DbAchievement,
  'achievementId' | 'progression'
> & {
  achievementId: TId
  progression: (typeof achievements)[TId]['initialProgression']
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
