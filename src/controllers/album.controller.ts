import { Request, Response } from "express";
import { Types } from "mongoose";

import { responseHandler } from "../common/response";
import { setFunctionName } from "../common/utils";
import { getUserAlbumPipeline } from "../core/db";
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
    const { action, folderName, userName } = request.body;
    if (action === FolderAction.Create) {
      fields.push({ key: "userName", type: "string" });
    }
    if (action !== FolderAction.Delete) {
      fields.push({ key: "folderName", type: "string" });
    }
    if (!baseController.validateBodyFields(request, response, updateFolder.name, fields)) {
      return;
    }

    const folderId = request.params.folderId;
    if (action !== FolderAction.Create
      && !baseController.validateId(folderId, response, updateFolder.name)) {
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