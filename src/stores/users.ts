import { supabase } from '@/supabase'
import { Database } from '@/types/supabase'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { compareCreatedAt } from '@/functions/compare'

export type User = Database['public']['Tables']['users']['Row']

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
  }),

  actions: {
    async fetchUsers() {
      const fetchedUsers = (await supabase.from('users').select('*')).data
      if (fetchedUsers) {
        this.users = fetchedUsers.toSorted(compareCreatedAt)
      }
    },

    getUser(id?: string) {
      return this.users.find((user) => user.id == id)
    },

    getUserSelectionHistory() {
      const json = localStorage.getItem('userSelectionHistory')
      return json ? (JSON.parse(json) as string[]) : []
    },

    recordUserSelection(userId: string) {
      const userSelectionHistory = this.getUserSelectionHistory()
      const index = userSelectionHistory.indexOf(userId)
      if (index >= 0) {
        userSelectionHistory.splice(index, 1)
      }
      userSelectionHistory.unshift(userId)
      localStorage.setItem(
        'userSelectionHistory',
        JSON.stringify(userSelectionHistory)
      )
    },
  },

  getters: {
    getCurrentUser: (state) => {
      const authUser = useAuthStore().auth
      if (!authUser) return null
      const user = state.users.find((user) => user.id == authUser?.id)
      if (!user) return null
      return {
        ...authUser,
        ...user,
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
