import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { Client } from "basic-ftp";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

import { convertToBool } from "../common/utils";

import { LogLevel, LogMessage, setLog } from "./logger";

const defaultPath = "photo-album";

export const uploadToFTP = async(
  buffer: Buffer,
  folderId: string,
  filename: string
): Promise<void> => {
  const client = new Client();
  const functionName = "uploadToFTP";

  if (!convertToBool(process.env.UPLOAD_FTP)) {
    multer.diskStorage({
      destination(_req, _file, cb) {
        const fullPath =  path.join(defaultPath, folderId);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
      },
      filename(_req, _file, cb) {
        cb(null, filename);
      },
    });
    return;
  }

  try {
    await client.access({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      host: process.env.FTP_HOST!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user: process.env.FTP_USER!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      password: process.env.FTP_PASSWORD!,
      secure: false,
    });

    const remoteFolder = `${defaultPath}/${folderId}/`;

    await client.ensureDir(remoteFolder);

    await client.cd(remoteFolder);

    const stream = Readable.from(buffer);
    await client.uploadFrom(stream, filename);
    setLog(LogLevel.INFO, LogMessage.SUCCESS, functionName);
  } catch (error) {
    const message = `${LogMessage.ERROR.FTPFAIL}\n${error}`;
    setLog(LogLevel.ERROR, message, functionName);
    throw error;
  } finally {
    client.close();
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
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
    fileSize: 1024 * 1024, // 1MB
  },
});

export default upload;
