import { supabase } from '@/supabase'
import { Achievement, UserAchievement } from '@/types/achievement'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export type MyAchievement = Achievement &
  Omit<UserAchievement, 'achievement' | 'user'> & {
    user: string | null
  }

const compareAchievementCreatedAt = (a: MyAchievement, b: MyAchievement) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

const compareAchievementUnlocked = (a: MyAchievement, b: MyAchievement) => {
  if (a.unlockedTime && b.unlockedTime)
    return (
      new Date(a.unlockedTime).getTime() - new Date(b.unlockedTime).getTime()
    )
  else if (a.unlockedTime && !b.unlockedTime) return 1
  else if (!a.unlockedTime && b.unlockedTime) return -1
  return 0
}

const compareAchievements = (a: MyAchievement, b: MyAchievement) => {
  if (a.unlocked && b.unlocked) return compareAchievementUnlocked(a, b)
  else if (a.unlocked && !b.unlocked) return -1
  else if (!a.unlocked && b.unlocked) return 1
  return compareAchievementCreatedAt(a, b)
}

export const useAchievementStore = defineStore('achievements', {
  state: () => {
    return {
      loading: true,
      achievementList: [] as MyAchievement[],
    }
  },
  actions: {
    async fetchAll() {
      const userId = useAuthStore().auth?.id
      if (!userId) return
      this.loading = true
      const achievements = await supabase
        .from('achievement')
        .select('*, user_achievement (leg, unlocked, unlockedTime, user)')
        .eq('user_achievement.user', userId)

      if (!achievements.data) return
      this.achievementList = achievements.data
        .map((a) => {
          const { user_achievement, ...achievement } = a
          const tempAchievement = achievement as Achievement
          if (user_achievement.length == 0) {
            return {
              ...tempAchievement,
              leg: null,
              unlocked: false,
              unlockedTime: null,
              user: null,
            }
          }
          return {
            ...tempAchievement,
            ...user_achievement[0],
          }
        })
        .toSorted(compareAchievements)
      this.loading = false
    },
  },
  getters: {
    achievements: (state) => {
      return state.achievementList.map((a) => {
        const { leg, unlocked, unlockedTime, user, ...achievement } = a
        return {
          ...achievement,
        } as Achievement
      })
    },

    userAchievements: (state) => {
      return state.achievementList
        .filter((a) => a.user !== null)
        .map((a) => {
          return {
            achievement: a.id,
            leg: a.leg,
            unlocked: a.unlocked,
            unlockedTime: a.unlockedTime,
            user: a.user,
          } as UserAchievement
        })
    },
  },
})
