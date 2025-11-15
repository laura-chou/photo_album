<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user-store";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useFormValidator } from "@/composables/useFormValidator";
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const { validateRequired, errorMessage } = useFormValidator();

const router = useRouter();
const userSore = useUserStore();
const account = ref("");
const password = ref("");

const handleLogin = async () => {
  const fields = {
    帳號: account.value,
    密碼: password.value,
  };

  if (!validateRequired(fields)) {
    triggerAlert(errorMessage.value);
    return;
  }

  try {
    await userSore.login(account.value, password.value);
    router.push("/album");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      switch (status) {
        case 401:
          triggerAlert("帳號或密碼錯誤");
          break;
        default:
          handleError(error, "login");
          break;
      }
    } else {
      handleError(error, "login");
    }
  }
};
</script>
<template>
  <NavbarComponent />
  <CssDoodleComponent />
  <div class="h-100 d-flex align-items-center justify-content-center">
    <AlertComponent
      v-for="alert in alerts"
      :key="alert.id"
      :message="alert.message"
      :type="alert.type"
    />
    <div class="card card-base">
      <div class="card-body card-body-flex">
        <div class="input-group">
          <span class="input-group-text" id="account">
            <VueFeather type="user"></VueFeather>
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
            <VueFeather type="lock"></VueFeather>
          </span>
          <input
            type="password"
            class="form-control shadow-none input-base"
            placeholder="密碼"
            v-model="password"
          />
        </div>
        <button type="button" class="btn btn-red" @click="handleLogin">登入</button>
      </div>
    </div>
  </div>
</template>
