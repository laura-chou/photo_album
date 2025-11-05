<script setup lang="ts">
defineOptions({
  name: "PhotoNavbar",
});

import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

const isLoginActive = computed(() => route.path.includes("login"));
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 text-center fw-bold">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: isLoginActive }"
              aria-current="page"
              href="./login"
              >登入</a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: !isLoginActive }" href="./register">註冊</a>
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
