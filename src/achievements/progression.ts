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
) => {
  const achievement = achievements[userAchievement.achievementId]
  const { legId, progression } = achievement.addProgression(
    userAchievement.progression,
    game,
    userId
  )
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
}

export const updateAchievements = async (game: Game) => {
  const achivements = getAchievementsForGame(game.type)

  for (const userId of game.players) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('userId', userId)

    if (error) {
      console.error('Error fetching user achievements!')
      return
    }

    for (const achievement of achivements) {
      const userAchievement = (data.find(
        (a) => a.achievementId == achievement.id
      ) ?? newUserAchievement(achievement.id, userId)) as UserAchievement<
        typeof achievement.id
      >

      addProgression(userAchievement, game, userId)

      const { error } = await supabase
        .from('achievements')
        .insert(userAchievement)

      if (error) {
        console.error('Could not save achievement to database')
        continue
      }

      // some signaling to the user maybe?
    }
  }
}
