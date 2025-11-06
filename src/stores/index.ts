import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useStore = defineStore("photo-album", {
  state: () => ({
    isLoading: false,
    captcha: {
      captchaId: "",
      svg: "",
    },
  }),
  getters: {
    captchaSvg: (state) => state.captcha.svg,
    captchaId: (state) => state.captcha.captchaId,
  },
  actions: {
    async handleLoading() {
      this.isLoading = true;
      const url = `${import.meta.env.VITE_APIURL}/user/captcha`;
      try {
        const response = await axios.get(url);
        this.captcha = response.data.data;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
  persist: true,
});
