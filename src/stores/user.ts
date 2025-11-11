import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAlbumStore } from "./album";
import axios from "axios";

axios.defaults.withCredentials = true;

interface CaptchaItem {
  captchaId: string;
  svg: string;
}

const domain = `${import.meta.env.VITE_APIURL}/user`;

export const useUserStore = defineStore(
  "user",
  () => {
    const albumStore = useAlbumStore();

    const isLoading = ref(false);
    const userName = ref("");
    const captcha = ref<CaptchaItem>({
      captchaId: "",
      svg: "",
    });

    const captchaSvg = computed(() => captcha.value.svg);
    const captchaId = computed(() => captcha.value.captchaId);

    const handleLoading = async () => {
      isLoading.value = true;
      try {
        const response = await axios.get(`${domain}/captcha`);
        captcha.value = response.data.data;
      } catch (error) {
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const login = async (account: string, password: string) => {
      try {
        const result = await axios.post(`${domain}/login`, { account, password });

        albumStore.setFolderList(result.data.data);
        userName.value = account;
      } catch (error) {
        throw error;
      }
    };

    const register = async (account: string, password: string, captchaText: string) => {
      try {
        const response = await axios.post(`${domain}/create`, {
          account,
          password,
          captchaText: captchaText,
          captchaId: captchaId.value,
        });
        captcha.value = response.data.data;
      } catch (error) {
        throw error;
      }
    };

    return {
      isLoading,
      userName,
      captcha,
      captchaSvg,
      captchaId,
      handleLoading,
      login,
      register,
    };
  },
  {
    persist: true,
  }
);
