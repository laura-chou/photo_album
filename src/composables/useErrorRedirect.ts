import axios from "axios";
import { useRouter } from "vue-router";

import { useErrorStore } from "@/stores/error-store";

export const useErrorRedirect = () => {
  const router = useRouter();
  const errorStore = useErrorStore();

  const handleError = (error: unknown, context?: string) => {
    const source = context ?? "UnknownFunction";
    let pushPath = "/error";

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status) {
        console.error(`${source} failed with status: ${status}`);
      } else {
        console.error(`${source} unknown error:\n`, String(error));
      }

      switch (status) {
        case 401:
          errorStore.message = "登入已過期，請重新登入";
          pushPath = "/";
          break;
      }
    }
    setTimeout(() => {
      router.push(`.${pushPath}`);
    }, 3000);
  };

  return { handleError };
};
