const base = "/album";

export const ROUTE = {
  FILE: `${base}/file`,
  ALBUM: base
} as const;

interface Folder {
  _id: string;
  name: string;
  files: string[];
}

interface UserAlbumItem {
  folder: Folder[];
}

type UpdateAlbumModel = {
  name: string;
  files: string[];
};

export const MOCK_ALBUM: UserAlbumItem[] = [
  {
    folder: [
      {
        _id: "507f1f77bcf86cd799439011",
        name: "A folder",
        files: ["Afile.jpg, Bfile.jpg"]
      }
    ]
  }
];

export const MOCK_UPDATE_DATA: UpdateAlbumModel = {
  name: "updateFolder",
  files: ["update.jpg"]
};