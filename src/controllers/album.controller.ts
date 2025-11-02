import { Request, Response } from "express";
import { Types } from "mongoose";

import { responseHandler } from "../common/response";
import { isNullOrEmpty, setFunctionName } from "../common/utils";
import { getFilePipeline, getUserAlbumPipeline } from "../core/db";
import { deleteFromFTP } from "../core/file-upload";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import Album from "../models/album.model";
import User from "../models/user.model";

import * as baseController from "./base.controller";

export enum FolderAction {
  Rename = "rename",
  Delete = "delete",
  Create = "create"
}

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

export const updateFolder = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    if (!baseController.validateContentType(request, response, updateFolder.name)) {
      return;
    }

    const fields = [
      { key: "action", type: "string" }
    ];
    const { action, folderName, userName, fileId } = request.body;
    switch (action) {
      case FolderAction.Create:
        fields.push({ key: "userName", type: "string" });
        fields.push({ key: "folderName", type: "string" });
        break;
      case FolderAction.Rename:
        fields.push({ key: "folderName", type: "string" });
        break;
    }

    if (!baseController.validateBodyFields(request, response, updateFolder.name, fields)) {
      return;
    }

    const folderId = request.params.folderId;
    if (action !== FolderAction.Create
      && !baseController.validateId(folderId, response, updateFolder.name)) {
      return;
    }

    if (action === FolderAction.Delete
      && !isNullOrEmpty(fileId)
      && !baseController.validateId(fileId, response, updateFolder.name)
    ) {
      return;
    }

    try {
      if (action === FolderAction.Create) {
        const userId = await User.findOne({ userName }).select("_id").lean().then(u => u?._id);
        if (userId) {
          const album = await Album.findOne({ userId });
          if (album) {
            album.folder.push({
              name: folderName,
              files: []
            });
            await album.save();
          } else {
            await Album.create({
              userId,
              folder: [
                {
                  name: folderName,
                  files: []
                }
              ]
            });
          }
        }
      } else if (action === FolderAction.Rename) {
        await Album.updateOne(
          {
            "folder._id": new Types.ObjectId(folderId)
          },
          {
            $set: {
              "folder.$.name": folderName
            }
          });
      } else if (action === FolderAction.Delete) {
        if (!isNullOrEmpty(fileId)) {
          const result = await Album.aggregate(getFilePipeline(fileId));
          if (!result || result.length === 0 ) {
            const message = `${LogMessage.ERROR.NOTFOUND}, \n{"action":${action},"folderId":${folderId}, "fileId":${fileId}}`;
            setLog(LogLevel.ERROR, message, updateFolder.name);
            responseHandler.notFound(response);
            return;
          }
          const storeName = result[0]?.file?.storeName;
          await Album.updateOne(
            { "folder.files._id": fileId },
            { $pull: { "folder.$[].files": { _id: fileId } } }
          );
          await deleteFromFTP(folderId, storeName);
        } else {
          await Album.updateOne(
            {
              "folder._id": new Types.ObjectId(folderId)
            },
            {
              $pull: {
                folder: { _id: new Types.ObjectId(folderId) }
              }
            }
          );
          await deleteFromFTP(folderId);
        }
      }
      const message = `${LogMessage.SUCCESS}, action: ${action}`;
      setLog(LogLevel.INFO, message, updateFolder.name);
      responseHandler.success(response);
    } catch (error) {
      baseController.errorHandler(response, error, updateFolder.name);
    }
  },
  "updateFolder"
);