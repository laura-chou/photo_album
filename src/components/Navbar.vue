<script setup lang="ts">
defineOptions({
  name: "PhotoNavbar",
});

import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

const isActive = computed(() => ["login", "album"].some((segment) => route.path.includes(segment)));
const props = withDefaults(defineProps<{ isLoggedIn?: boolean }>(), { isLoggedIn: false });
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-midnight">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="javascript:void(0)">
        <img class="d-inline-block me-2" src="@/assets/logo.png" height="25" />
        <span class="fw-bold">線上相簿</span>
      </a>
      <button
        class="navbar-toggler shadow-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbar"
        aria-controls="navbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse flex-grow-0" id="navbar">
        <ul v-if="!props.isLoggedIn" class="navbar-nav me-auto mb-2 mb-lg-0 text-center fw-bold">
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive }"
              aria-current="page"
              to="/login"
              >登入</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: !isActive }" to="/register"
              >註冊</router-link
            >
          </li>
        </ul>
        <ul v-else class="navbar-nav me-auto mb-2 mb-lg-0 text-center fw-bold">
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive }"
              aria-current="page"
              to="/album"
              >相簿</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: !isActive }" to="/setting"
              >設定</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/logout">登出</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  z-index: 99;
}
</style>
