import { supabase } from '@/supabase'
import { User as AuthUser } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useOnlineStore } from './online'
import { useStatsStore } from './stats'
import { User, useUsersStore } from './users'

const initAuth = async (auth: AuthUser) => {
  useAuthStore().auth = auth
  useOnlineStore().initRoom(auth.id)
  await useUsersStore().fetchUsers()
  await useStatsStore().fetchAll()
}

supabase.auth.onAuthStateChange(async (_, session) => {
  const user = session?.user
  if (user && useAuthStore().auth?.id != user?.id) {
    initAuth(user)
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: undefined as AuthUser | undefined,
  }),

  actions: {
    async getSession() {
      const prevAuth = this.auth
      const response = await supabase.auth.getSession()
      this.auth = response.data.session?.user
      if (this.auth && this.auth.id != prevAuth?.id) {
        initAuth(this.auth)
      }
    },

    async signUp(name: string, email: string, password: string) {
      await supabase.auth.signUp({ email, password })
      await this.setUserParams({ name })
    },

    async signIn(email: string, password: string) {
      await supabase.auth.signInWithPassword({ email, password })
    },

    async signOut() {
      this.auth = undefined
      await supabase.auth.signOut()
    },

    async updatePassword(password: string) {
      await supabase.auth.updateUser({ password })
    },

    async forgotPassword(email: string) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://darts.quest/#/password',
      })
    },

    async setUserParams(user: Partial<User>) {
      if (!this.auth) throw Error()
      const prevName = await supabase
        .from('users')
        .select('name')
        .eq('id', this.auth.id)
      const copy = {
        // because user from parameter may include other fields
        name: user.name,
        createdAt: user.createdAt,
        id: user.id,
        walkOn: user.walkOn,
        walkOnTime: user.walkOnTime,
        walkOnEndTime: user.walkOnEndTime,
      } satisfies Partial<User>
      if (prevName.data?.length == 0) {
        await supabase.from('users').insert(copy)
      } else {
        await supabase.from('users').update(copy).eq('id', this.auth.id)
        await useUsersStore().fetchUsers()
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
