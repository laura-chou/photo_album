import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import type { Folder } from "@/types/album";

axios.defaults.withCredentials = true;

const albumDomain = `${import.meta.env.VITE_APIURL}/album`;

export const useAlbumStore = defineStore(
  "album",
  () => {
    const folder = ref<Folder[]>([]);

    const setFolderList = (newList: Folder[]) => {
      folder.value = newList;
    };

    const updateFolderName = async (id: string, name: string) => {
      const folderData = folder.value.find((item) => item._id === id);
      if (folderData) {
        try {
          await axios.patch(`${albumDomain}/${id}`, {
            action: "rename",
            folderName: name,
          });
          folderData.name = name;
        } catch (error) {
          throw error;
        }
      } else {
        throw "folder data not found";
      }
    };

    const deleteFolder = async (id: string) => {
      try {
        await axios.patch(`${albumDomain}/${id}`, {
          action: "delete",
        });
        const index = folder.value.findIndex((item) => item._id === id);
        if (index !== -1) {
          folder.value.splice(index, 1);
        }
      } catch (error) {
        throw error;
      }
    };

    const createFolder = async (name: string) => {
      try {
        const result = await axios.patch(`${albumDomain}/0`, {
          action: "create",
          folderName: name,
        });
        folder.value = result.data.data;
      } catch (error) {
        throw error;
      }
    };

    return {
      folder,
      setFolderList,
      updateFolderName,
      deleteFolder,
      createFolder,
    };
  },
  {
    persist: true,
  }
);
