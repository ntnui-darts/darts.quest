import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from './supabase'

const GameViewX01 = () => import('@/views/GameViewX01.vue')
const GameViewRoundDaClock = () => import('@/views/GameViewRoundDaClock.vue')
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const UserView = () => import('@/views/UserView.vue')
const StatsView = () => import('@/views/StatsView.vue')

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '/', name: 'root', redirect: { name: 'home' } },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/game-x01', name: 'game-x01', component: GameViewX01 },
  {
    path: '/game-round-da-clock',
    name: 'game-round-da-clock',
    component: GameViewRoundDaClock,
  },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/user', name: 'user', component: UserView },
  { path: '/stats', name: 'stats', component: StatsView },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  // dirty auth hack
  if (to.hash.startsWith('#access_token=')) {
    const jwt: any = {}
    to.hash.split('&').forEach((kvp) => {
      const [key, value] = kvp.split('=')
      jwt[key.replace('#', '')] = value
    })
    if ('access_token' in jwt && 'refresh_token' in jwt) {
      supabase.auth.setSession(jwt)
      return { name: 'home' }
    }
  }
})
