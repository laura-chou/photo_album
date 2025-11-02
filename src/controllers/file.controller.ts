import fs from "fs/promises";
import path from "path";

import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { convertToBool, setFunctionName } from "../common/utils";
import { getFolderFilesCountPipeline } from "../core/db";
import { uploadToFTP } from "../core/file-upload";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import Album, { Files } from "../models/album.model";

import * as baseController from "./base.controller";

export const readPhoto = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const folderId = request.params.folderId;
    const fileName = request.params.fileName;

    if (!convertToBool(process.env.UPLOAD_FTP)) {
      const localPath = path.join(process.cwd(), "photo-album", folderId, fileName);
      try {
        await fs.access(localPath);
        setLog(LogLevel.INFO, LogMessage.SUCCESS, readPhoto.name);
        response.status(HTTP_STATUS.OK).sendFile(localPath);
        return;
      } catch (error: unknown) {
        const message = `${LogMessage.ERROR.NOTFOUND}\n${error}`;
        setLog(LogLevel.WARN, message, readPhoto.name);
        response.status(HTTP_STATUS.NOT_FOUND).send(RESPONSE_MESSAGE.NOT_FOUND);
        return;
      }
    }

    const ftpUrl = `http://${process.env.FTP_HOST}/${process.env.FTP_USER}/photo-album/${folderId}/${fileName}`;
    response.status(HTTP_STATUS.FOUND)
      .location(ftpUrl)
      .type("html")
      .send(`<p>Redirecting to <a href="${ftpUrl}">${ftpUrl}</a></p>`);
  },
  "readPhoto"
);

export const uploadPhoto = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const contentType: string | undefined = request.headers["content-type"];
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_CONTENT_TYPE, uploadPhoto.name);
      responseHandler.badRequest(response, "CONTENT_TYPE");
      return;
    }

    const files = request.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      setLog(LogLevel.ERROR, RESPONSE_MESSAGE.NO_FILE, uploadPhoto.name);
      responseHandler.badRequest(response, "NO_FILE");
      return;
    }

    const fields = [
      { key: "folderId", type: "string" }
    ];
    if (!baseController.validateBodyFields(request, response, uploadPhoto.name, fields)) {
      return;
    }

    const { folderId } = request.body;
    if (!baseController.validateId(folderId, response, uploadPhoto.name)) {
      return;
    }

    try {
      const result = await Album.aggregate(getFolderFilesCountPipeline(folderId));
      if (!result || result.length === 0 ) {
        const message = `${LogMessage.ERROR.NOTFOUND}, folderId: ${folderId}`;
        setLog(LogLevel.ERROR, message, uploadPhoto.name);
        responseHandler.notFound(response);
        return;
      }
      const currentFileCount = result[0]?.fileCount;
      if (files.length + currentFileCount > 3) {
        files.forEach(file => file.buffer = Buffer.alloc(0));
        setLog(LogLevel.ERROR, RESPONSE_MESSAGE.UPLOAD_LIMIT, uploadPhoto.name);
        responseHandler.badRequest(response, "UPLOAD_LIMIT");
        return;
      }
      
      const newFiles: Files[] = [];
      for (const file of files) {
        const ext = file.originalname.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        newFiles.push(
          {
            customName: file.originalname,
            storeName: filename
          }
        );
        await uploadToFTP(file.buffer, folderId, filename);
      }

      await Album.updateOne(
        { "folder._id": folderId },
        { $push: { "folder.$.files": { $each: newFiles } } }
      );

      setLog(LogLevel.INFO, LogMessage.SUCCESS, uploadPhoto.name);
      responseHandler.success(response);
    } catch (error) {
      baseController.errorHandler(response, error, uploadPhoto.name);
    }
  },
  "uploadPhoto"
);