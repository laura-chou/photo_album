import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoadData from '@/views/LoadData.vue'
import NotFound from '@/views/NotFound.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LoadData,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
