import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

const GameView = () => import('@/views/GameView.vue');
const HomeView = () => import('@/views/HomeView.vue');

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '/', name: 'root', redirect: { name: 'home' } },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/game', name: 'game', component: GameView },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
