import Prompt from '@/components/Prompt.vue'
import { compareCreatedAt } from '@/functions/compare'
import { supabase } from '@/supabase'
import { Database } from '@/types/supabase'
import { AuthUser } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useLoadingStore } from './loading'
import { useModalStore } from './modal'

export type User = Database['public']['Tables']['users']['Row']

const validateUserParams = async () => {
  if (!useUsersStore().getCurrentUser) {
    // uh oh!
    useModalStore().push(
      Prompt,
      {
        text: "Something went wrong! Your username has been reset. Go to 'My Profile' to edit.",
        buttons: [
          {
            text: 'Ok.',
            onClick: async () => {
              useLoadingStore().loading = true
              await useAuthStore().setUserParams({ name: '<?>' })
              useLoadingStore().loading = false
              useModalStore().pop()
              await validateUserParams()
            },
          },
        ],
      },
      {}
    )
    return
  }
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    _users: [] as User[],
    _customUsers: [] as User[],
  }),

  actions: {
    async fetchUsers() {
      const fetchedUsers = (await supabase.from('users').select('*')).data
      if (fetchedUsers) {
        this._users = fetchedUsers
          .filter((user) => user.visible || user.id == useAuthStore().auth?.id)
          .toSorted(compareCreatedAt)

        await validateUserParams()
      }
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
    users(): User[] {
      return [...this._users, ...this._customUsers]
    },

    getCurrentUser(): (User & AuthUser) | null {
      const authUser = useAuthStore().auth
      if (!authUser) return null
      const user = this.users.find((user) => user.id == authUser?.id)
      if (!user) return null
      return {
        ...authUser,
        ...user,
      }
    },

    getUser() {
      return (id?: string) => {
        return this.users.find((user) => user.id == id)
      }
    },

    getName() {
      return (id?: string) => {
        return this.getUser(id)?.name ?? 'Unknown'
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
