import fs from "fs/promises";
import path from "path";

import { Request, Response } from "express";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../common/constants";
import { convertToBool, setFunctionName } from "../common/utils";
import { LogLevel, LogMessage, setLog } from "../core/logger";

export const readPhoto = setFunctionName(
  async(request: Request, response: Response): Promise<void> => {
    const fileName = request.params.name;

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