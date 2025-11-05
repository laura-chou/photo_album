import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.withCredentials = true;

export const useStore = defineStore("photo-album", {
  state: () => ({
    isLoading: false,
    captcha: {
      svg: "",
    },
    token: "",
  }),
  getters: {
    captchaSvg: (state) => state.captcha.svg,
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
    async handleLogin(account: string, password: string) {
      const url = `${import.meta.env.VITE_APIURL}/user/login`;

      try {
        const response = await axios.post(url, {
          account,
          password,
        });
        this.token = response.data.data.token;
      } catch (error) {
        throw error;
      }
    },
  },
  persist: true,
});
