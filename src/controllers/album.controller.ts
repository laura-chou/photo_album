import fs from "fs/promises";
import path from "path";

import { Request, Response } from "express";
import { Types } from "mongoose";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { convertToBool, setFunctionName } from "../common/utils";
import { getUserAlbumPipeline } from "../core/db";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import Album from "../models/album.model";
import User from "../models/user.model";

import * as baseController from "./base.controller";

export const readPhoto = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const fileName = request.params.fileName;

    if (convertToBool(process.env.UPLOAD_FTP)) {
      const localPath = path.join(process.cwd(), "images", fileName);
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

    const ftpUrl = `http://${process.env.FTP_HOST}/${process.env.FTP_USER}/${fileName}`;
    response.status(HTTP_STATUS.FOUND)
      .location(ftpUrl)
      .type("html")
      .send(`<p>Redirecting to <a href="${ftpUrl}">${ftpUrl}</a></p>`);
  },
  "readPhoto"
);

export const getAlbum = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const userName = request.params.userName;

    try {
      const album = await User.aggregate(getUserAlbumPipeline(userName));

      setLog(LogLevel.INFO, LogMessage.SUCCESS, getAlbum.name);
      responseHandler.success(response, album);
    } catch (error) {
      baseController.errorHandler(response, error, getAlbum.name);
    }
  },
  "getAlbum"
);

export const updateAlbum = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const folderId = request.params.folderId;

    if (!baseController.validateId(folderId, response, updateAlbum.name)) {
      return;
    }

    if (!baseController.validateContentType(request, response, updateAlbum.name)) {
      return;
    }

    const fields = [
      { key: "name", type: "string" },
      { key: "files", type: "array" }
    ];
    if (!baseController.validateBodyFields(request, response, updateAlbum.name, fields)) {
      return;
    }

    const folderName = request.body.name.trim();
    const folderFiles = request.body.files;

    try {
      await Album.updateOne(
        {
          "folder._id": new Types.ObjectId(folderId)
        },
        {
          $set: {
            "folder.$.name": folderName,
            "folder.$.files": folderFiles
          }
        });

      setLog(LogLevel.INFO, LogMessage.SUCCESS, updateAlbum.name);
      responseHandler.success(response);
    } catch (error) {
      baseController.errorHandler(response, error, updateAlbum.name);
    }
  },
  "updateAlbum"
);