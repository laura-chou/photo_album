<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useFormValidator } from "@/composables/useFormValidator";
import { useAuth } from "@/composables/useUserAuth";
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const { validateRequired, errorMessage } = useFormValidator();
const { login } = useAuth();

defineOptions({
  name: "LoginPage",
});

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
    await login(account.value, password.value);
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
          break;
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
    <AlertMessage
      v-for="alert in alerts"
      :key="alert.id"
      :message="alert.message"
      :type="alert.type"
    />
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
        <button type="button" class="btn btn-red" @click="handleLogin">登入</button>
      </div>
    </div>
  </div>
</template>
