import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { Client, enterPassiveModeIPv4 } from "basic-ftp";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

import { convertToBool } from "../common/utils";

import { LogLevel, LogMessage, setLog } from "./logger";

const defaultPath = "photo-album";

export const connectFtpClient = async(client: Client): Promise<void> => {
  await client.access({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    host: process.env.FTP_HOST!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user: process.env.FTP_USER!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    password: process.env.FTP_PASSWORD!,
    secure: false
  });
  client.prepareTransfer = enterPassiveModeIPv4;
};

const isFtpNotFound = (error: unknown): boolean => {
  if (typeof error === "object" && error !== null) {
    const err = error as { code?: number; message?: string };

    return (
      err.code === 550 ||
      Boolean(err.message?.toLowerCase().includes("no such file")) ||
      Boolean(err.message?.toLowerCase().includes("not found"))
    );
  }

  return false;
};

export const uploadToFTP = async(
  buffer: Buffer,
  userId: string,
  folderId: string,
  fileName: string
): Promise<void> => {
  const functionName = "uploadToFTP";

  if (!convertToBool(process.env.PRD_ENV)) {
    const fullPath = path.join(defaultPath, userId, folderId);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const filePath = path.join(fullPath, fileName);
    await fs.promises.writeFile(filePath, buffer);
    return;
  }

  const client = new Client();
  try {
    await connectFtpClient(client);

    const remoteFolder = `/${defaultPath}/${userId}/${folderId}`;

    await client.ensureDir(remoteFolder);
    await client.cd(remoteFolder);

    const stream = Readable.from(buffer);
    await client.uploadFrom(stream, fileName);
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
  userId: string,
  folderId: string,
  fileName?: string
): Promise<void> => {
  const functionName = "deleteFromFTP";

  if (!convertToBool(process.env.PRD_ENV)) {
    const targetPath = fileName
      ? path.join(defaultPath, userId, folderId, fileName)
      : path.join(defaultPath, userId, folderId);

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

  const client = new Client();

  try {
    await connectFtpClient(client);

    const remoteBase = `/${defaultPath}/${userId}/${folderId}`;

    if (fileName) {
      const remoteFilePath = `${remoteBase}/${fileName}`;
      await client.remove(remoteFilePath);
      setLog(LogLevel.INFO, `FTP file delete success: ${remoteFilePath}`, functionName);
    } else {
      await client.list(remoteBase);
      await client.removeDir(remoteBase);
      setLog(LogLevel.INFO, `FTP folder delete success: ${remoteBase}`, functionName);
    }
  } catch (error) {
    if (isFtpNotFound(error)) {
      const message = `FTP does not exist path, user: ${userId}, folder: ${folderId}`;
      setLog(LogLevel.WARN, message, functionName);
    } else {
      const message = `${LogMessage.ERROR.FTPFAIL}\n${error}`;
      setLog(LogLevel.ERROR, message, functionName);
      throw error;
    }
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
