import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StatsView from '../views/StatsView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    children: [
      { path: 'checkin', name: 'checkin', component: () => import('../views/CheckInView.vue') },
      { path: 'task', name: 'task', component: () => import('../views/TaskView.vue') },
      { path: 'note', name: 'note', component: () => import('../views/NoteView.vue') },
      { path: 'lottery', name: 'lottery', component: () => import('../views/LotteryView.vue') },
    ],
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
