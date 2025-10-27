import { Request, Response, NextFunction } from "express";

import { RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { isNullOrEmpty, isTypeString } from "../common/utils";
import { LogLevel, setLog } from "../core/logger";

const functionName = "validateLoginRequest";

const validateLoginRequest = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const contentType: string | undefined = request.headers["content-type"];
  if (contentType !== "application/json") {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_CONTENT_TYPE, functionName);
    responseHandler.badRequest(response, "CONTENT_TYPE");
    return;
  }

  if (isNullOrEmpty(request.body.account) || isNullOrEmpty(request.body.password)) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_JSON_KEY, functionName);
    responseHandler.badRequest(response, "JSON_KEY");
    return;
  }

  if (!isTypeString(request.body.account) || !isTypeString(request.body.password)) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_JSON_FORMAT, functionName);
    responseHandler.badRequest(response, "JSON_FORMAT");
    return;
  }

  next();
};

export default validateLoginRequest;