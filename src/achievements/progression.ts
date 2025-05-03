import { GameType } from '@/games/games'
import { supabase } from '@/supabase'
import {
  Achievement,
  AchievementId,
  newUserAchievement,
  UserAchievement,
} from '@/types/achievement'
import { Game } from '@/types/game'
import { achievements } from './achievements'

export const getAchievementsForGame = (
  gameType: GameType
): (Achievement<unknown> & { id: AchievementId })[] => {
  return Object.entries(achievements)
    .filter(([_, achievement]) => achievement.gameTypes.includes(gameType))
    .map(([id, achievement]) => ({ id: id as AchievementId, ...achievement }))
}

export const addProgression = <T extends AchievementId>(
  userAchievement: UserAchievement<T>,
  game: Game,
  userId: string
): boolean => {
  const achievement = achievements[userAchievement.achievementId]
  const newProgression = achievement.addProgression(
    userAchievement.progression,
    game,
    userId
  )
  if (!newProgression) return false
  const { legId, progression } = newProgression

  userAchievement.progression = progression
  if (legId) {
    userAchievement.legIds.push(legId)
  }
  if (
    userAchievement.achievedAt == null &&
    achievement.isAchieved(userAchievement.progression)
  ) {
    userAchievement.achievedAt = new Date().toISOString()
  }
  return true
}

export const updateAchievements = async (game: Game) => {
  const achievements = getAchievementsForGame(game.type)

  for (const userId of game.players) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('userId', userId)

    if (error) {
      console.error('Error fetching user achievements!')
      return
    }

    for (const achievement of achievements) {
      const userAchievement = (data.find(
        (a) => a.achievementId == achievement.id
      ) ?? newUserAchievement(achievement.id, userId)) as UserAchievement<
        typeof achievement.id
      >

      const changed = addProgression(userAchievement, game, userId)
      if (!changed) continue

      const { error } = await supabase
        .from('achievements')
        .upsert(userAchievement)

      if (error) {
        console.error('Could not save achievement to database')
        continue
      }

      // some signaling to the user maybe?
    }
  }
}
