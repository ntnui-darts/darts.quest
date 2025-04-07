import { supabase } from '@/supabase'
import { GameType } from '@/games/games'
import {
  AchievementId,
  AchievementTracker,
  newUserAchievement,
  UserAchievement,
} from '@/types/achievement'
import { Game } from '@/types/game'

export const getTrackersForMode = (
  gameType: GameType
): AchievementTracker[] => {
  switch (gameType) {
    case 'x01':
      return []
    case 'cricket':
      return []
    case 'killer':
      return []
    case 'rtc':
      return []
    case 'skovhugger':
      return []
    default:
      return []
  }
}

export const trackAchievements = async (game: Game) => {
  const trackers = getTrackersForMode(game.type)

  for (const userId of game.players) {
    const { data, error } = await supabase
      .from('user_achievement')
      .select('achievement')
      .eq('user', userId)
      .eq('unlocked', true)

    if (error) {
      console.error('Error fetching user achievements!')
      return
    }

    const unlockedAchievements = data
      ? data.map((item) => item.achievement as AchievementId)
      : []

    // filter trackers to check first
    const trackersToCheck = trackers.filter(
      (tracker) => !unlockedAchievements.includes(tracker.achievementId)
    )

    // I guess we could check for all users simultaneously, but I prefer
    // this more readable and explicit version
    for (const tracker of trackersToCheck) {
      const { leg, achieved } = tracker.checkCondition(game, userId)
      if (achieved) {
        const userAchievement: UserAchievement = {
          ...newUserAchievement(tracker.achievementId, userId),
          leg,
          unlocked: true,
        }
        const { error } = await supabase
          .from('user_achievement')
          .insert(userAchievement)

        if (error) {
          console.error('Could not save achievement to database')
          continue
        }

        // some signaling to the user maybe?
      }
    }
  }
}
