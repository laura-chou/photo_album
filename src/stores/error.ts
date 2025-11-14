import { defineStore } from "pinia";

export const useErrorStore = defineStore("error", {
  state: () => ({
    message: "",
  }),
  actions: {
    setError(msg: string) {
      this.message = msg;
    },
    clearError() {
      this.message = "";
    },
  },
});
