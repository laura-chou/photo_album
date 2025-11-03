import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.withCredentials = true

export const useStore = defineStore('photo-album', {
  state: () => ({
    isLoading: false,
    captcha: {},
  }),
  getters: {},
  actions: {
    async handleLoading() {
      this.isLoading = true
      // const url = `${import.meta.env.VITE_APIURL}/user/captcha`
      // try {
      //   await axios.get(url)
      //     .then((response) => {
      //       this.captcha = response.data
      //     })
      //     .catch((error) => {
      //       throw new Error(error.message)
      //     })
      // } finally {
      //   this.isLoading = false
      // }
    },
  },
  persist: true,
})
