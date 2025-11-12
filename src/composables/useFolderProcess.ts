import axios from "axios";
import type { Folder, FileItem } from "@/types/album";
import errorImage from "@/assets/error-image.png";

const fileDomain = `${import.meta.env.VITE_APIURL}/file`;
const isProduction = Number(import.meta.env.VITE_PRD_ENV) === 1;

export const useFolderProcess = () => {
  const getImageSrc = async (id: string, fileName: string): Promise<string> => {
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
        const imageUrl = await getImageSrc(folder._id, file.storeName);
        return {
          ...file,
          storeName: imageUrl,
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
