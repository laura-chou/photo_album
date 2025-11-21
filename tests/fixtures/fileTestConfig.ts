import { ItemAction } from "../../src/controllers/album.controller";

const base = "/file";

export const ROUTE = {
  FILE: base,
  UPLOAD: `${base}/upload`
} as const;

type UpdateFileModel = {
  action: ItemAction;
  fileName?: string;
};

type AlbumAggreModel = {
  folderId: string;
  file: {
    storeName: string;
  };
};

export const MOCK_UPDATE_DATA: UpdateFileModel = {
  action: ItemAction.Rename,
  fileName: "updateFile"
};

export const MOCK_DELETE_DATA: UpdateFileModel = {
  action: ItemAction.Delete
};

export const MOCK_ALBUMAGGRE: AlbumAggreModel = {
  folderId: "507f1f77bcf86cd799439012",
  file: {
    storeName: "exampleStoreName.jpg"
  }
};