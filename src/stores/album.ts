import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import type { Folder } from "@/types/album";

axios.defaults.withCredentials = true;

const albumDomain = `${import.meta.env.VITE_APIURL}/album`;
const fileDomain = `${import.meta.env.VITE_APIURL}/file`;

export const useAlbumStore = defineStore(
  "album",
  () => {
    const folder = ref<Folder[]>([]);

    const setFolderList = (newList: Folder[]) => {
      folder.value = newList;
    };

    const getImageSrc = async (id: string, fileName: string): Promise<string> => {
      try {
        const result = await axios.get(`${fileDomain}/${id}/${fileName}`, {
          withCredentials: true,
          responseType: "blob",
        });
        return URL.createObjectURL(result.data);
      } catch (error) {
        console.log(error);
        return "@/assets/error-image.png";
      }
    };

    const updateFolderName = async (id: string, name: string) => {
      const f = folder.value.find((item) => item._id === id);
      if (f) {
        f.name = name;
      }
    };

    const deleteFolder = async (id: string) => {
      const index = folder.value.findIndex((item) => item._id === id);
      if (index !== -1) {
        folder.value.splice(index, 1);
      }
    };

    const createFolder = async (name: string) => {
      const newFolder: Folder = {
        name,
        files: [],
        _id: Date.now().toString(),
      };
      folder.value.push(newFolder);
    };

    return {
      folder,
      setFolderList,
      getImageSrc,
      updateFolderName,
      deleteFolder,
      createFolder,
    };
  },
  {
    persist: true,
  }
);
