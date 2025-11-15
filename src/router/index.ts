import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import LoadingView from "@/views/LoadingView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import LoginView from "@/views/LoginView.vue";
import LogoutView from "@/views/LogoutView.vue";
import AlbumView from "@/views/AlbumView.vue";
import RegisterView from "@/views/RegisterView.vue";
import SettingFolderView from "@/views/SettingFolderView.vue";
import SettingFilesView from "@/views/SettingFilesView.vue";
import ErrorView from "@/views/ErrorView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: LoadingView,
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/register",
    component: RegisterView,
  },
  {
    path: "/album",
    component: AlbumView,
    meta: { requiresAuth: true },
  },
  {
    path: "/folder",
    component: SettingFolderView,
    meta: { requiresAuth: true },
  },
  {
    path: "/file/:id",
    component: SettingFilesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/logout",
    component: LogoutView,
    meta: { requiresAuth: true },
  },
  {
    path: "/error",
    component: ErrorView,
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
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
