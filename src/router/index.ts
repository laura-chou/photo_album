import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import LoadData from "@/views/LoadData.vue";
import NotFound from "@/views/NotFound.vue";
import Login from "@/views/Login.vue";
import Logout from "@/views/Logout.vue";
import Album from "@/views/Album.vue";
import Register from "@/views/Register.vue";
import Setting from "@/views/Setting.vue";
import SettingDetail from "@/views/SettingDetail.vue";
import ServerError from "@/views/ServerError.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: LoadData,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/album",
    component: Album,
    meta: { requiresAuth: true },
  },
  {
    path: "/setting",
    component: Setting,
    meta: { requiresAuth: true },
  },
  {
    path: "/edit/:id",
    component: SettingDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/logout",
    component: Logout,
    meta: { requiresAuth: true },
  },
  {
    path: "/error",
    component: ServerError,
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem("user");
  const album = localStorage.getItem("album");

  const isLoggedIn = !!(user && album);

  if (to.meta.requiresAuth && !isLoggedIn) {
    next("/");
  } else if (to.path === "/login" && isLoggedIn) {
    next("/album");
  } else {
    next();
  }
});

export default router;
