import { Request, Response, NextFunction } from "express";

import { RESPONSE_MESSAGE } from "../common/constants";
import { responseHandler } from "../common/response";
import { isNullOrEmpty, isTypeString } from "../common/utils";
import { getCaptcha } from "../core/captcha";
import { LogLevel, setLog } from "../core/logger";

const functionName = "validateRegisterRequest";

const verifyCaptcha = (
  captchaId: string,
  captchaText: string
): boolean => {
  const storedText = getCaptcha(captchaId);

  if (!storedText) {
    return false;
  }

  return storedText.toLowerCase() === captchaText.toLowerCase();
};

const validateRegisterRequest = (
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
  const account = request.body.account;
  const password = request.body.password;
  const captchaId = request.body.captchaId;
  const captchaText = request.body.captchaText;

  if (isNullOrEmpty(account) 
    || isNullOrEmpty(password)
    || isNullOrEmpty(captchaId) 
    || isNullOrEmpty(captchaText)
  ) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_JSON_KEY, functionName);
    responseHandler.badRequest(response, "JSON_KEY");
    return;
  }

  if (!isTypeString(account) 
    || !isTypeString(password)
    || !isTypeString(captchaId)
    || !isTypeString(captchaText)
  ) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_JSON_FORMAT, functionName);
    responseHandler.badRequest(response, "JSON_FORMAT");
    return;
  }

  if (!verifyCaptcha(captchaId, captchaText)) {
    setLog(LogLevel.ERROR, RESPONSE_MESSAGE.INVALID_CAPTCHA, functionName);
    responseHandler.badRequest(response, "INVALID_CAPTCHA");
    return;
  }

  next();
};

export default validateRegisterRequest;