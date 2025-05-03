import { achievements } from '@/achievements/achievements'
import { supabase } from '@/supabase'
import {
  Achievement,
  AchievementId,
  UserAchievement,
} from '@/types/achievement'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

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
      const userAchievements = await supabase
        .from('achievements')
        .select('*')
        .eq('userId', userId)

      if (!userAchievements.data) return

      this.userAchievements =
        userAchievements.data as UserAchievement<AchievementId>[]

      this.loading = false
    },
  },

  getters: {
    achievementsWithProgression(): (Achievement<unknown> &
      UserAchievement<AchievementId>)[] {
      return Object.entries(achievements).map(([id, achievement]) => {
        const userAchievement = this.userAchievements.find(
          (a) => a.achievementId == id
        )
        return Object.assign(achievement, userAchievement)
      })
    },
  },
})
