import axios from "axios";
import { useStore } from "@/stores";

const domain = `${import.meta.env.VITE_APIURL}/user`;

export const useAuth = () => {
  const store = useStore();

  const login = async (account: string, password: string) => {
    try {
      await axios.post(`${domain}/login`, { account, password }, { withCredentials: true });
    } catch (error) {
      throw error;
    }
  };

  const register = async (account: string, password: string, captcha: string) => {
    try {
      const response = await axios.post(
        `${domain}/create`,
        { account, password, captchaText: captcha, captchaId: store.captchaId },
        { withCredentials: true }
      );
      store.captcha = response.data.data;
    } catch (error) {
      throw error;
    }
  };

  return { login, register };
};
