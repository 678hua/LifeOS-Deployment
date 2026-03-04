import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CheckInView from '../views/CheckInView.vue'
import TaskView from '../views/TaskView.vue'
import NoteView from '../views/NoteView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckInView
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskView
  },
  {
    path: '/notes',
    name: 'notes',
    component: NoteView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
