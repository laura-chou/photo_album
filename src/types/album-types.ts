export interface FileItem {
  _id: string;
  customName: string;
  storeName: string;
  imageUrl: string;
}

export interface Folder {
  name: string;
  files: FileItem[];
  _id: string;
}
