import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Swiper, SwiperSlide } from "swiper/vue";
import { createApp } from "vue";
import VueFeather from "vue-feather";

import App from "./App.vue";
import router from "./router";

import "css-doodle";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/pagination";
import "@/styles/common.scss";

import AlertComponent from "@/components/AlertComponent.vue";
import CssDoodleComponent from "@/components/CssDoodleComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import NavbarComponent from "@/components/NavbarComponent.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.component("VueFeather", VueFeather);
app.component("VueSwiper", Swiper);
app.component("SwiperSlide", SwiperSlide);
app.component("NavbarComponent", NavbarComponent);
app.component("CssDoodleComponent", CssDoodleComponent);
app.component("AlertComponent", AlertComponent);
app.component("LoadingComponent", LoadingComponent);

app.use(pinia);
app.use(router);

app.mount("#app");
