import { Response } from "express";

import { LogMessage } from "../core/logger";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "./constants";

const MESSAGE_MAP = {
  CONTENT_TYPE: RESPONSE_MESSAGE.INVALID_CONTENT_TYPE,
  JSON_KEY: RESPONSE_MESSAGE.INVALID_JSON_KEY,
  JSON_FORMAT: RESPONSE_MESSAGE.INVALID_JSON_FORMAT,
  INVALID_ID: RESPONSE_MESSAGE.INVALID_ID,
  INVALID_CAPTCHA: RESPONSE_MESSAGE.INVALID_CAPTCHA,
  EXPIRED_CAPTCHA: RESPONSE_MESSAGE.EXPIRED_CAPTCHA,
  UPLOAD_LIMIT: RESPONSE_MESSAGE.UPLOAD_LIMIT,
  NO_FILE: RESPONSE_MESSAGE.NO_FILE,
  LIMIT_FORMAT: RESPONSE_MESSAGE.LIMIT_FORMAT,
} as const;

type BadRequestType = keyof typeof MESSAGE_MAP;

interface ApiResponse<T> {
  status: number
  message: string
  data?: T
}
  
const sendResponse = <T>(
  res: Response,
  status: number,
  message: string,
  data?: T
): void => {
  const response: ApiResponse<T> = {
    status,
    message,
    ...(data !== undefined && { data })
  };
  res.status(status).json(response);
};
  
export const responseHandler = {
  success<T>(res: Response, data?: T): void {
    sendResponse(
      res, 
      HTTP_STATUS.OK, 
      RESPONSE_MESSAGE.SUCCESS,
      data
    );
  },

  created<T>(res: Response, data?: T): void {
    sendResponse(
      res, 
      HTTP_STATUS.CREATED, 
      RESPONSE_MESSAGE.SUCCESS,
      data
    );
  },

  badRequest<T>(res: Response, type: BadRequestType, data?: T): void
  {
    sendResponse(
      res, 
      HTTP_STATUS.BAD_REQUEST, 
      MESSAGE_MAP[type],
      data
    );
  },

  tooManyRequests(res: Response): void {
    sendResponse(
      res,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      RESPONSE_MESSAGE.TOO_MANY_REQUESTS
    );
  },

  unauthorized(res: Response, message: string = LogMessage.ERROR.UNKNOWN): void {
    sendResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      message
    );
  },

  forbidden(res: Response): void {
    sendResponse(
      res, 
      HTTP_STATUS.FORBIDDEN, 
      RESPONSE_MESSAGE.FORBIDDEN_CORS
    );
  },

  notFound(res: Response): void {
    sendResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      RESPONSE_MESSAGE.NOT_FOUND
    );
  },

  conflict(res: Response, message: string = RESPONSE_MESSAGE.DATA_ALREADY_EXISTS): void {
    sendResponse(
      res,
      HTTP_STATUS.CONFLICT,
      message
    );
  },

  payloadTooLarge(res: Response): void {
    sendResponse(
      res, 
      HTTP_STATUS.PAYLOAD_TOO_LARGE, 
      RESPONSE_MESSAGE.LIMIT_FILE_SIZE
    );
  },

  serverError(res: Response): void {
    sendResponse(
      res, 
      HTTP_STATUS.SERVER_ERROR, 
      RESPONSE_MESSAGE.SERVER_ERROR
    );
  }
};