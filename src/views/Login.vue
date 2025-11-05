<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useStore } from "@/stores";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
const { handleError } = useErrorRedirect();
const { alertMessage, showAlert, triggerAlert } = useAlert();
const store = useStore();

defineOptions({
  name: "LoginPage",
});

const account = ref("");
const password = ref("");

const login = async () => {
  if (account.value.trim().length === 0 || password.value.trim().length === 0) {
    triggerAlert("請輸入帳號及密碼");
    return;
  }

  try {
    await store.handleLogin(account.value, password.value);
    console.log("登入成功");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      switch (status) {
        case 401:
          triggerAlert("帳號或密碼錯誤");
          break;
        default:
          handleError(error, "handleLogin", status);
      }
    } else {
      handleError(error, "handleLogin");
    }
  }
};
</script>
<template>
  <PhotoNavbar />
  <CssDoodle />
  <div class="h-100 d-flex align-items-center justify-content-center">
    <AlertMessage v-if="showAlert" :message="alertMessage" />
    <div class="card card-base">
      <div class="card-body card-body-flex">
        <div class="input-group">
          <span class="input-group-text" id="account">
            <vue-feather type="user"></vue-feather>
          </span>
          <input
            type="text"
            class="form-control shadow-none input-base"
            placeholder="帳號"
            v-model="account"
          />
        </div>
        <div class="input-group">
          <span class="input-group-text" id="password">
            <vue-feather type="lock"></vue-feather>
          </span>
          <input
            type="password"
            class="form-control shadow-none input-base"
            placeholder="密碼"
            v-model="password"
          />
        </div>
        <button type="button" class="btn btn-red" @click="login">登入</button>
      </div>
    </div>
  </div>
</template>
