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
    const fullPath = path.join(defaultPath, folderId);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const filePath = path.join(fullPath, filename);
    await fs.promises.writeFile(filePath, buffer);
    return;
  }

  try {
    await client.access({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      host: process.env.FTP_HOST!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user: process.env.FTP_USER!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      password: process.env.FTP_USER!,
      secure: false
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

export const deleteFromFTP = async(
  folderId: string,
  filename?: string
): Promise<void> => {
  const client = new Client();
  const functionName = "deleteFromFTP";

  if (!convertToBool(process.env.UPLOAD_FTP)) {
    const targetPath = filename
      ? path.join(defaultPath, folderId, filename)
      : path.join(defaultPath, folderId);

    try {
      await fs.promises.rm(targetPath, { recursive: true, force: true });
      setLog(LogLevel.INFO, `local delete success: ${targetPath}`, functionName);
    } catch (error) {
      const message = `local delete failed: ${targetPath}\n${error}`;
      setLog(LogLevel.ERROR, message, functionName);
      throw error;
    }

    return;
  }

  try {
    await client.access({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      host: process.env.FTP_HOST!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user: process.env.FTP_USER!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      password: process.env.FTP_USER!,
      secure: false,
    });

    const remoteBase = `${defaultPath}/${folderId}`;

    if (filename) {
      const remoteFilePath = `${remoteBase}/${filename}`;
      await client.remove(remoteFilePath);
      setLog(LogLevel.INFO, `FTP file delete success: ${remoteFilePath}`, functionName);
    } else {
      await client.removeDir(remoteBase);
      setLog(LogLevel.INFO, `FTP folder delete success: ${remoteBase}`, functionName);
    }
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
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Invalid file format"));
    } else {
      cb(null, true);
    }
  }
});

export default upload;
