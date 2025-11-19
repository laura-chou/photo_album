import fs from "fs/promises";
import path from "path";

import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { convertToBool, getNowDate, setFunctionName } from "../common/utils";
import { getFilePipeline, getFilesCountPipeline, toObjectId } from "../core/db";
import { deleteFromFTP, uploadToFTP } from "../core/file-upload";
import { getUserIdFromToken } from "../core/jwt";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import Album, { Files } from "../models/album.model";

import { FolderAction, getAlbum } from "./album.controller";
import * as baseController from "./base.controller";

export const readPhoto = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const fileName = request.params.fileName;

    const userId = getUserIdFromToken(request);
    if (!baseController.validateUserIdFromToken(userId, response, readPhoto.name)) {
      return;
    }

    if (!convertToBool(process.env.PRD_ENV)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const localPath = path.join(process.cwd(), "photo-album", userId!, fileName);
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

    const ftpUrl = `http://${process.env.FTP_HOST}/${process.env.FTP_USER}/photo-album/${userId}/${fileName}`;
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

    const userId = getUserIdFromToken(request);
    if (!baseController.validateUserIdFromToken(userId, response, uploadPhoto.name)) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [result] = await Album.aggregate(getFilesCountPipeline(userId!, folderId));
      if (!result) {
        const message = `${LogMessage.ERROR.NOTFOUND}, userId: ${userId}`;
        setLog(LogLevel.ERROR, message, uploadPhoto.name);
        responseHandler.notFound(response);
        return;
      }

      const currentFileCount = result.fileCount;
      if (files.length + currentFileCount > 5) {
        files.forEach(file => file.buffer = Buffer.alloc(0));
        setLog(LogLevel.ERROR, RESPONSE_MESSAGE.FILE_LIMIT, uploadPhoto.name);
        responseHandler.badRequest(response, "FILE_LIMIT");
        return;
      }

      const newFiles: Files[] = [];
      for (const file of files) {
        const ext = file.originalname.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        newFiles.push(
          {
            customName: file.originalname.split(".").join("."),
            storeName: filename,
            createDate: getNowDate()
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await uploadToFTP(file.buffer, userId!, filename);
      }

      await Album.updateOne(
        { 
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          userId: toObjectId(userId!),
          "folder._id": toObjectId(folderId), 
        },
        { $push: { "folder.$.files": { $each: newFiles } } }
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userAlbum = await getAlbum(userId!);

      setLog(LogLevel.INFO, LogMessage.SUCCESS, uploadPhoto.name);
      responseHandler.success(response, userAlbum);
    } catch (error) {
      baseController.errorHandler(response, error, uploadPhoto.name);
    }
  },
  "uploadPhoto"
);


export const updateFile = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const fileId = request.params.fileId;
    if (!baseController.validateId(fileId, response, updateFile.name)) {
      return;
    }
    
    if (!baseController.validateContentType(request, response, updateFile.name)) {
      return;
    }

    const fields = [
      { key: "action", type: "string" }
    ];
    const { action, fileName } = request.body;
    if (action === FolderAction.Rename) {
      fields.push({ key: "fileName", type: "string" });
    }
    if (!baseController.validateBodyFields(request, response, updateFile.name, fields)) {
      return;
    }

    const userId = getUserIdFromToken(request);
    if (!baseController.validateUserIdFromToken(userId, response, updateFile.name)) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const albumAggre = await Album.aggregate(getFilePipeline(userId!, fileId));
      if (!albumAggre || albumAggre.length === 0 ) {
        const message = `${LogMessage.ERROR.NOTFOUND}, \n{"action":${action}, "userId":${userId}, "fileId":${fileId}}`;
        setLog(LogLevel.ERROR, message, updateFile.name);
        responseHandler.notFound(response);
        return;
      }
      const folderId = albumAggre[0].folderId;

      if (action === FolderAction.Rename) {
        await Album.updateOne(
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userId: toObjectId(userId!),
            "folder._id": toObjectId(folderId),
            "folder.files._id": toObjectId(fileId)
          },
          {
            $set: {
              "folder.$.files.$[file].customName": fileName
            }
          },
          {
            arrayFilters: [{ "file._id": toObjectId(fileId) }]
          }
        );
      } else if (action === FolderAction.Delete) {
        const storeName = albumAggre[0].file.storeName;
        await Album.updateOne(
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userId: toObjectId(userId!), 
            "folder._id": toObjectId(folderId),
            "folder.files._id": fileId
          },
          { $pull: { "folder.$.files": { _id: toObjectId(fileId) } } }
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await deleteFromFTP(userId!, storeName);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userAlbum = await getAlbum(userId!);
      
      const message = `${LogMessage.SUCCESS}, action: ${action}`;
      setLog(LogLevel.INFO, message, updateFile.name);
      responseHandler.success(response, userAlbum);
    } catch (error) {
      baseController.errorHandler(response, error, updateFile.name);
    }
  },
  "updateFile"
);