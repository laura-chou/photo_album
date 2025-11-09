import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import LoadData from "@/views/LoadData.vue";
import NotFound from "@/views/NotFound.vue";
import Login from "@/views/Login.vue";
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
  },
  {
    path: "/setting",
    component: Setting,
  },
  {
    path: "/edit/:id",
    component: SettingDetail,
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

export default router;
