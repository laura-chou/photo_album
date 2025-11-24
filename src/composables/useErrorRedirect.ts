import axios from "axios";
import { useRouter } from "vue-router";

import { useErrorStore } from "@/stores/error-store";
import { useUserStore } from "@/stores/user-store";

export const useErrorRedirect = () => {
  const router = useRouter();
  const userStore = useUserStore();
  const errorStore = useErrorStore();

  const handleError = (error: unknown, context?: string) => {
    const source = context ?? "UnknownFunction";
    let pushPath = "/error";
    let redirect = true;

    console.error(`${source} failed:\n`, String(error));

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data.data;
      const type = error.response?.data.errorType;
      switch (status) {
        case 400:
          redirect = false;
          if (type === "INVALID_CAPTCHA") {
            errorStore.message = "驗證碼錯誤";
          } else if (type === "FILE_LIMIT") {
            errorStore.message = "已達上傳上限 (最多 5 個檔案)";
          }
          if (data) userStore.captcha = data;
          break;
        case 401:
          if (type === "WRONG_PASSWORD") {
            errorStore.message = "帳號或密碼錯誤";
            redirect = false;
          } else {
            errorStore.message = "登入已過期，請重新登入";
            pushPath = "/logout";
          }
          break;
        case 409:
          redirect = false;
          errorStore.message = "使用者已註冊";
          break;
        case 413:
          redirect = false;
          errorStore.message = "檔案太大，單檔不得超過 1MB";
          break;
        case 429:
          if (source.includes("loading")) {
            pushPath = "/login";
          } else {
            redirect = false;
            errorStore.message = "請求過多，請稍後再試";
          }
          break;
      }
    }

    if (redirect) {
      setTimeout(() => {
        router.push(`.${pushPath}`);
      }, 3000);
    }
  };

  return { handleError };
};
