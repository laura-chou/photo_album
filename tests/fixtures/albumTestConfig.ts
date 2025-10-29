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
  _id: string;
  folder: Folder[];
}

export const MOCK_ALBUM: UserAlbumItem[] = [
  {
    _id: "507f1f77bcf86cd799439011",
    folder: [
      {
        _id: "abc123",
        name: "A folder",
        files: ["Afile.jpg, Bfile.jpg"]
      }
    ]
  }
];