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
    folder: [
      {
        name: "folderName",
        files: [
          {
            _id: "6905b",
            customName: "custNameA",
            storeName:
              "https://i0.wp.com/nutrition168.com/wp-content/uploads/2023/07/%E5%A4%8F%E6%97%A5%E6%B0%B4%E6%9E%9C-01-e1689155512379.jpg?fit=1024%2C1024&ssl=1",
          },
          {
            _id: "7905b",
            customName: "custNameB",
            storeName:
              "https://i.epochtimes.com/assets/uploads/2022/07/id13774908-shutterstock_1168129996.jpg",
          },
          {
            _id: "8905b",
            customName: "custNameC",
            storeName:
              "https://blog.vitabox.com.tw/wp-content/uploads/2018/12/%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7-2018-12-26-%E4%B8%8B%E5%8D%882.38.27-1-1024x733.png",
          },
        ],
        _id: "6901e",
      },
      {
        name: "folderName2",
        files: [
          {
            _id: "9905b",
            customName: "custNameq",
            storeName:
              "https://i0.wp.com/nutrition168.com/wp-content/uploads/2023/07/%E5%A4%8F%E6%97%A5%E6%B0%B4%E6%9E%9C-01-e1689155512379.jpg?fit=1024%2C1024&ssl=1",
          },
          {
            _id: "0905b",
            customName: "custNamew",
            storeName:
              "https://i.epochtimes.com/assets/uploads/2022/07/id13774908-shutterstock_1168129996.jpg",
          },
          {
            _id: "1905b",
            customName: "custNamee",
            storeName:
              "https://blog.vitabox.com.tw/wp-content/uploads/2018/12/%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7-2018-12-26-%E4%B8%8B%E5%8D%882.38.27-1-1024x733.png",
          },
        ],
        _id: "6902e",
      },
    ],
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
    async updateFolderName(id: string, name: string) {
      const folder = this.folder.find((item) => item._id === id);
      if (folder) {
        folder.name = name;
      }
    },
    async deleteFolder(id: string) {
      const index = this.folder.findIndex((item) => item._id === id);
      if (index !== -1) {
        this.folder.splice(index, 1);
      }
    },
    async createFolder(name: string) {
      // const index = this.folder.findIndex((item) => item._id === id);
      // if (index !== -1) {
      //   this.folder.splice(index, 1);
      // }
    },
  },
  persist: true,
});
