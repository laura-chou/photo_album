import { Request, Response } from "express";

import { RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { getNowDate, setFunctionName } from "../common/utils";
import { toObjectId } from "../core/db";
import { deleteFromFTP } from "../core/file-upload";
import { getUserIdFromToken } from "../core/jwt";
import { LogLevel, LogMessage, setLog } from "../core/logger";
import Album, { Folder } from "../models/album.model";

import * as baseController from "./base.controller";

export enum ItemAction {
  Rename = "rename",
  Delete = "delete",
  Create = "create"
}

export const getAlbum = async(userId: string): Promise<Folder[] | null>  => {
  try {
    const result = await Album.findOne({ userId })
      .sort({ createDate: -1 })
      .select({ _id: 0, userId: 0 })
      .exec();
    setLog(LogLevel.INFO, LogMessage.SUCCESS, "getAlbum");
    return result?.folder ?? [];
  } catch (error) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.SERVER_ERROR, "getAlbum");
    throw error;
  }
};

export const updateFolder = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    if (!baseController.validateContentType(request, response, updateFolder.name)) {
      return;
    }

    const fields = [
      { key: "action", type: "string" }
    ];
    const { action, folderName } = request.body;
    if (action !== ItemAction.Delete) {
      fields.push({ key: "folderName", type: "string" });
    }

    if (!baseController.validateBodyFields(request, response, updateFolder.name, fields)) {
      return;
    }

    const folderId = request.params.folderId;
    if (action !== ItemAction.Create
      && !baseController.validateId(folderId, response, updateFolder.name)) {
      return;
    }

    const userId = getUserIdFromToken(request);
    if (!baseController.validateUserIdFromToken(userId, response, updateFolder.name)) {
      return;
    }

    try {
      if (action === ItemAction.Create) {
        const album = await Album.findOne({ userId });
        if (album) {
          if (album.folder.length > 5) {
            setLog(LogLevel.ERROR, RESPONSE_MESSAGE.FOLDER_LIMIT, updateFolder.name);
            responseHandler.badRequest(response, "FOLDER_LIMIT");
            return;
          }
          album.folder.push({
            name: folderName,
            files: [],
            createDate: getNowDate()
          });
          await album.save();
        } else {
          await Album.create({
            userId,
            folder: [
              {
                name: folderName,
                files: [],
                createDate: getNowDate()
              }
            ]
          });
        }
      } else if (action === ItemAction.Rename) {
        await Album.updateOne(
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userId: toObjectId(userId!),
            "folder._id": toObjectId(folderId)
          },
          {
            $set: {
              "folder.$[f].name": folderName
            }
          },
          {
            arrayFilters: [{ "f._id": toObjectId(folderId) }]
          }
        );
      } else if (action === ItemAction.Delete) {
        await Album.updateOne(
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userId: toObjectId(userId!), 
            "folder._id": toObjectId(folderId)
          },
          {
            $pull: {
              folder: { _id: toObjectId(folderId) }
            }
          }
        );
        await deleteFromFTP(folderId);
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const userAlbum = await getAlbum(userId!);

      const message = `${LogMessage.SUCCESS}, action: ${action}`;
      setLog(LogLevel.INFO, message, updateFolder.name);
      responseHandler.success(response, userAlbum);
    } catch (error) {
      baseController.errorHandler(response, error, updateFolder.name);
    }
  },
  "updateFolder"
);