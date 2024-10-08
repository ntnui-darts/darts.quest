import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from './supabase'

const GameView = () => import('@/views/GameView.vue')
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const UserView = () => import('@/views/UserView.vue')
const PasswordView = () => import('@/views/PasswordView.vue')
const StatisticsView = () => import('@/views/StatisticsView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const SpectateLobbyView = () => import('@/views/SpectateLobbyView.vue')
const SpectateView = () => import('@/views/SpectateView.vue')
const TournamentLobbyView = () => import('@/views/TournamentLobbyView.vue')
const TournamentCreateView = () => import('@/views/TournamentCreateView.vue')
const TournamentView = () => import('@/views/TournamentView.vue')

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '/', name: 'root', redirect: { name: 'home' } },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/game', name: 'game', component: GameView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/user', name: 'user', component: UserView },
  { path: '/password', name: 'password', component: PasswordView },
  { path: '/statistics', name: 'statistics', component: StatisticsView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/spectate', name: 'spectate', component: SpectateView },
  {
    path: '/spectate-lobby',
    name: 'spectate-lobby',
    component: SpectateLobbyView,
  },
  {
    path: '/tournament-lobby',
    name: 'tournament-lobby',
    component: TournamentLobbyView,
  },
  {
    path: '/tournament-create',
    name: 'tournament-create',
    component: TournamentCreateView,
  },
  {
    path: '/tournament',
    name: 'tournament',
    component: TournamentView,
  },
  // { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
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
      // return { name: 'home' }
    }
  }
})
