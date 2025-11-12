import { defineStore } from "pinia";
import axios from "axios";
import { ref, computed } from "vue";
import type { Folder } from "@/types/album";

axios.defaults.withCredentials = true;

const albumDomain = `${import.meta.env.VITE_APIURL}/album`;
const fileDomain = `${import.meta.env.VITE_APIURL}/file`;

export const useAlbumStore = defineStore(
  "album",
  () => {
    const folder = ref<Folder[]>([]);
    const isUploading = ref(false);
    const uploadProgress = ref(0);

    const setFolderList = (newList: Folder[]) => {
      folder.value = newList;
    };

    const getFilsByFolderId = (id: string) =>
      computed(() => {
        const targetFolder = folder.value.find((item) => item._id === id);
        return targetFolder ? targetFolder.files : [];
      });

    const updateFolderName = async (id: string, name: string) => {
      try {
        const result = await axios.patch(`${albumDomain}/${id}`, {
          action: "rename",
          folderName: name,
        });
        folder.value = result.data.data;
      } catch (error) {
        throw error;
      }
    };

    const deleteFolder = async (id: string) => {
      try {
        const result = await axios.patch(`${albumDomain}/${id}`, {
          action: "delete",
        });
        folder.value = result.data.data;
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

    const uploadFiles = async (id: string, files: File[]) => {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folderId", id);
      isUploading.value = true;
      uploadProgress.value = 0;
      try {
        const result = await axios.post(`${fileDomain}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
          },
        });
        folder.value = result.data.data;
      } catch (error) {
        throw error;
      } finally {
        isUploading.value = false;
        uploadProgress.value = 0;
      }
    };

    const updateFileName = async (id: string, name: string) => {
      try {
        const result = await axios.patch(`${fileDomain}/${id}`, {
          action: "rename",
          fileName: name,
        });
        folder.value = result.data.data;
      } catch (error) {
        throw error;
      }
    };

    const deleteFile = async (id: string) => {
      try {
        const result = await axios.patch(`${fileDomain}/${id}`, {
          action: "delete",
        });
        folder.value = result.data.data;
      } catch (error) {
        throw error;
      }
    };

    return {
      folder,
      isUploading,
      uploadProgress,
      setFolderList,
      getFilsByFolderId,
      updateFolderName,
      deleteFolder,
      createFolder,
      uploadFiles,
      updateFileName,
      deleteFile,
    };
  },
  {
    persist: true,
  }
);
