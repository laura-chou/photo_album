import axios from "axios";

import errorImage from "@/assets/error-image.png";
import type { Folder, FileItem } from "@/types/album-types";

const fileDomain = `${import.meta.env.VITE_APIURL}/file`;
const isProduction = Number(import.meta.env.VITE_PRD_ENV) === 1;

export const useFolderProcess = () => {
  const getImageSrc = async (fileName: string): Promise<string> => {
    try {
      const url = `${fileDomain}/${fileName}`;
      if (isProduction) {
        const result = await axios.get(url, {
          withCredentials: true,
        });
        return result.data;
      } else {
        const result = await axios.get(url, {
          withCredentials: true,
          responseType: "blob",
        });

        return URL.createObjectURL(result.data);
      }
    } catch (error) {
      console.log(error);
      return errorImage;
    }
  };

  const processFolderFiles = async (folder: Folder): Promise<Folder> => {
    const processedFiles: FileItem[] = await Promise.all(
      folder.files.map(async (file) => {
        const imageUrl = await getImageSrc(file.storeName);
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
