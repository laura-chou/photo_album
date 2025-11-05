<script setup lang="ts">
defineOptions({
  name: "RegisterPage",
});

import { useStore } from "@/stores";

const store = useStore();
</script>
<template>
  <PhotoNavbar />
  <CssDoodle />
  <div class="h-100 d-flex align-items-center justify-content-center">
    <div class="card card-base">
      <div class="card-body card-body-flex">
        <div class="input-group">
          <span class="input-group-text" id="account">
            <vue-feather type="user"></vue-feather>
          </span>
          <input type="text" class="form-control shadow-none input-base" placeholder="帳號" />
        </div>
        <div class="input-group">
          <span class="input-group-text" id="password">
            <vue-feather type="lock"></vue-feather>
          </span>
          <input
            type="password"
            class="form-control shadow-none input-base"
            maxlength="12"
            placeholder="密碼長度 8 - 12 個字"
          />
        </div>
        <div class="input-group">
          <input type="text" class="form-control shadow-none input-base" placeholder="驗證碼" />
          <div id="svg" v-html="store.captchaSvg"></div>
        </div>
        <button type="button" class="btn btn-red">註冊</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  height: 350px;
}

#svg {
  border-radius: 0 12px 12px 0;
  overflow: hidden;
}
</style>
