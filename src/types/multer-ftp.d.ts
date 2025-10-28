declare module "multer-ftp" {
  import { StorageEngine } from "multer";

  interface FTPStorageOptions {
    basepath: string;
    ftp: {
      host: string;
      secure?: boolean;
      user: string;
      password: string;
    };
    destination?: (
      req: Express.Request,
      file: Express.Multer.File,
      options: FTPStorageOptions,
      cb: (error: Error | null, destination: string) => void
    ) => void;
  }

  class FTPStorage implements StorageEngine {
    constructor(options: FTPStorageOptions);
  }

  export default FTPStorage;
}
