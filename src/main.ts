import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import VueFeather from "vue-feather";
import { Swiper, SwiperSlide } from "swiper/vue";

import "css-doodle";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/pagination";
import "@/styles/common.scss";

import Navbar from "@/components/Navbar.vue";
import CssDoodle from "@/components/CssDoodle.vue";
import AlertMessage from "@/components/AlertMessage.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.component("VueFeather", VueFeather);
app.component("VueSwiper", Swiper);
app.component("SwiperSlide", SwiperSlide);
app.component("PhotoNavbar", Navbar);
app.component("CssDoodle", CssDoodle);
app.component("AlertMessage", AlertMessage);

app.use(pinia);
app.use(router);

app.mount("#app");
