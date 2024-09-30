import Prompt from '@/components/Prompt.vue'
import { compareCreatedAt } from '@/functions/compare'
import { supabase } from '@/supabase'
import { Database } from '@/types/supabase'
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
    users: [] as User[],
  }),

  actions: {
    async fetchUsers() {
      const fetchedUsers = (await supabase.from('users').select('*')).data
      if (fetchedUsers) {
        this.users = fetchedUsers
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

    getUser: (state) => (id?: string) => {
      return state.users.find((user) => user.id == id)
    },

    getName: (state) => (id?: string) => {
      return state.users.find((user) => user.id == id)?.name ?? 'Unknown'
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
