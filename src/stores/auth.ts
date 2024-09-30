import { supabase } from '@/supabase'
import { User as AuthUser } from '@supabase/supabase-js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useOnlineStore } from './online'
import { useStatsStore } from './stats'
import { User, useUsersStore } from './users'

const initAuth = async (auth: AuthUser) => {
  const authStore = useAuthStore()
  authStore.auth = auth
  if (authStore.signUpName) {
    await authStore.setUserParams({ name: authStore.signUpName })
    authStore.signUpName = null
  }
  useOnlineStore().initRoom(auth.id)
  await useUsersStore().fetchUsers()
  await useStatsStore().fetchAll()
  await supabase
    .from('users')
    .update({ lastActive: new Date().toISOString() })
    .eq('id', auth.id)
}

supabase.auth.onAuthStateChange(async (_, session) => {
  const user = session?.user
  const authStore = useAuthStore()
  if (user && authStore.auth?.id != user.id) {
    initAuth(user)
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth: undefined as AuthUser | undefined,
    signUpName: null as string | null,
  }),

  actions: {
    async getSession() {
      const prevAuth = this.auth
      const response = await supabase.auth.getSession()
      this.auth = response.data.session?.user
      if (this.auth && this.auth.id != prevAuth?.id) {
        await initAuth(this.auth)
      }
    },

    async signUp(name: string, email: string, password: string) {
      this.signUpName = name
      await supabase.auth.signUp({ email, password })
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

      const copy = {
        // because user from parameter may include other fields
        id: user.id ?? this.auth.id,
        name: user.name,
        createdAt: user.createdAt,
        walkOn: user.walkOn,
        walkOnTime: user.walkOnTime,
        walkOnEndTime: user.walkOnEndTime,
      } satisfies Partial<User>

      await supabase.from('users').upsert(copy)
      await useUsersStore().fetchUsers()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
