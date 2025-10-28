import path from "path";

import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import FTPStorage from "multer-ftp";

import { convertToBool } from "../common/utils";

const storage: StorageEngine =
  convertToBool(process.env.UPLOAD_FTP)
    ? multer.diskStorage({
        destination(_req, _file, cb) {
          cb(null, "images/");
        },
        filename(_req, file, cb) {
          cb(null, "photoalbum" + Date.now() + path.extname(file.originalname));
        },
      })
    : (new FTPStorage({
        basepath: "/",
        ftp: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          host: process.env.FTP_HOST!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          user: process.env.FTP_USER!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          password: process.env.FTP_PASSWORD!,
          secure: false,
        },
        destination(_req, file, options, cb): void {
          cb(null, options.basepath + "vuephoto" + Date.now() + path.extname(file.originalname));
        },
      }) as unknown as StorageEngine);

const upload = multer({
  storage,
  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (!file.mimetype.includes("image")) {
      cb(new Error("LIMIT_FORMAT"));
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

export default upload;
