import { achievements } from '@/achievements/achievements'
import { supabase } from '@/supabase'
import { AchievementId, UserAchievement } from '@/types/achievement'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const compareAchievementAchievedAt = (
  a: UserAchievement<AchievementId>,
  b: UserAchievement<AchievementId>
) =>
  new Date(a.achievedAt ?? '').getTime() -
  new Date(b.achievedAt ?? '').getTime()

const compareAchievements = (
  a: UserAchievement<AchievementId>,
  b: UserAchievement<AchievementId>
) => {
  if (a.achievedAt && b.achievedAt) return compareAchievementAchievedAt(a, b)
  else if (a.achievedAt && !b.achievedAt) return -1
  else if (!a.achievedAt && b.achievedAt) return 1
  return 0
}

export const useAchievementStore = defineStore('achievements', {
  state: () => {
    return {
      loading: true,
      userAchievements: [] as UserAchievement<AchievementId>[],
    }
  },
  actions: {
    async fetchAll() {
      const userId = useAuthStore().auth?.id
      if (!userId) return

      this.loading = true
      const achievements = await supabase
        .from('achievements')
        .select('*')
        .eq('userId', userId)

      if (!achievements.data) return

      this.userAchievements = achievements.data
        .map((a) => a as UserAchievement<AchievementId>)
        .toSorted(compareAchievements)

      this.loading = false
    },
  },

  getters: {
    achievements(state) {
      return Object.entries(achievements).map(([id, achievement]) => {
        const userAchievement = state.userAchievements.find(
          (a) => a.achievementId == id
        )
        return Object.assign(achievement, userAchievement)
      })
    },
  },
})
