import { FolderAction } from "../../src/controllers/album.controller";

const base = "/album";

export const ROUTE = {
  ALBUM: base,
} as const;

interface Files {
  _id?: string;
  customName: string;
  storeName: string;
  createDate: Date;
}

interface Folder {
  _id?: string;
  name: string;
  files: Files[];
  createDate: Date;
}

interface FileItem {
  file: Files;
}

type UpdateFolderModel = {
  action: FolderAction;
  folderName?: string;
  userName?: string;
  fileId?: string;
};

export const MOCK_ALBUM: Folder[] = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "A folder",
    files: [
      { _id: "507f1f77bcf86cd799439012", customName: "customA.jpg", storeName: "storeA.jpg", createDate: new Date("2025-11-18T17:51:51.832Z") }
    ],
    createDate: new Date("2025-11-18T17:51:19.310Z")
  }
];

export const MOCK_EXPECTED_ALBUM = JSON.parse(JSON.stringify(MOCK_ALBUM));

// export const MOCK_FILE: FileItem[] = [{
//   file: { _id: "507f1f77bcf86cd799439012", customName: "customA.jpg", storeName: "storeA.jpg", createDate: new Date("2025-11-18T17:51:51.832Z") }
// }];

export const MOCK_UPDATE_DATA: UpdateFolderModel = {
  action: FolderAction.Rename,
  folderName: "updateFolder"
};

export const MOCK_DELETE_FOLDER_DATA: UpdateFolderModel = {
  action: FolderAction.Delete
};

export const MOCK_DELETE_INVALID_DATA: UpdateFolderModel = {
  action: FolderAction.Delete,
  fileId: "invalid-id"
};

export const MOCK_CREATE_DATA: UpdateFolderModel = {
  action: FolderAction.Create,
  userName: "userName",
  folderName: "createFolder"
};