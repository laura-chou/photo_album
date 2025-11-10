<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useFormValidator } from "@/composables/useFormValidator";
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const { validateRequired, validatePasswordLength, errorMessage } = useFormValidator();

defineOptions({
  name: "RegisterPage",
});

const userStore = useUserStore();

const account = ref("");
const password = ref("");
const captcha = ref("");

const handleRegister = async () => {
  const fields = {
    帳號: account.value,
    密碼: password.value,
    驗證碼: captcha.value,
  };

  if (!validateRequired(fields)) {
    triggerAlert(errorMessage.value);
    return;
  }

  if (!validatePasswordLength(password.value)) {
    triggerAlert(errorMessage.value);
    return;
  }

  try {
    await userStore.register(account.value, password.value, captcha.value);
    triggerAlert("註冊成功", "success");
    account.value = "";
    password.value = "";
    captcha.value = "";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data.data;
      switch (status) {
        case 400:
          triggerAlert("驗證碼錯誤");
          if (data) userStore.captcha = data;
          break;
        case 409:
          triggerAlert("使用者已註冊");
          break;
        default:
          handleError(error, "handleRegister", status);
          break;
      }
    } else {
      handleError(error, "handleRegister");
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
            maxlength="12"
            placeholder="密碼長度 8 - 12 個字"
            v-model="password"
          />
        </div>
        <div class="input-group">
          <input
            type="text"
            class="form-control shadow-none input-base"
            placeholder="驗證碼"
            v-model="captcha"
          />
          <div id="svg" v-html="userStore.captchaSvg"></div>
        </div>
        <button type="button" class="btn btn-red" @click="handleRegister">註冊</button>
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
