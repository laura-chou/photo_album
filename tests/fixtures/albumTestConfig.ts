import { FolderAction } from "../../src/controllers/album.controller";

const base = "/album";

export const ROUTE = {
  ALBUM: base,
  UPDATE: `${base}/folder`,
} as const;

interface Files {
  _id: string;
  customName: string;
  storeName: string;
}

interface Folder {
  _id: string;
  name: string;
  files: Files[];
}

interface UserAlbumItem {
  folder: Folder[];
}

type UpdateFolderModel = {
  action: FolderAction;
  folderName?: string;
  userName?: string;
};

export const MOCK_ALBUM: UserAlbumItem[] = [
  {
    folder: [
      {
        _id: "507f1f77bcf86cd799439011",
        name: "A folder",
        files: [
          { _id: "507f1f77bcf86cd799439012", customName: "customA.jpg", storeName: "storeA.jpg" }
        ]
      }
    ]
  }
];

export const MOCK_UPDATE_DATA: UpdateFolderModel = {
  action: FolderAction.Rename,
  folderName: "updateFolder"
};

export const MOCK_DELETE_DATA: UpdateFolderModel = {
  action: FolderAction.Delete
};

export const MOCK_CREATE_DATA: UpdateFolderModel = {
  action: FolderAction.Create,
  userName: "userName",
  folderName: "createFolder"
};