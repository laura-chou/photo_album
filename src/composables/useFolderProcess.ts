import axios from "axios";

import errorImage from "@/assets/error-image.png";
import type { Folder, FileItem } from "@/types/album-types";

axios.defaults.withCredentials = true;

const fileDomain = `${import.meta.env.VITE_APIURL}/file`;

export const useFolderProcess = () => {
  const getImageSrc = async (folderId: string, fileName: string): Promise<string> => {
    try {
      const url = `${fileDomain}/${folderId}/${fileName}`;

      const result = await axios.get(url, {
        responseType: "blob",
      });

      return URL.createObjectURL(result.data);
    } catch (error) {
      console.log(error);
      return errorImage;
    }
  };

  const processFolderFiles = async (folder: Folder): Promise<Folder> => {
    const processedFiles: FileItem[] = await Promise.all(
      folder.files.map(async (file) => {
        const imageUrl = await getImageSrc(folder._id, file.storeName);
        return {
          ...file,
          imageUrl,
        };
      })
    );

    return {
      ...folder,
      files: processedFiles,
    };
  };

  const processFolders = async (folders: Folder[]): Promise<Folder[]> => {
    return Promise.all(folders.map(processFolderFiles));
  };

  return {
    processFolders,
  };
};
