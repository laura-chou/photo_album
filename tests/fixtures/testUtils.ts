import path from "path";

import jwt from "jsonwebtoken";
import request, { Response, Request } from "supertest";

import app from "../../src/app";
import { CONTENT_TYPE, HTTP_STATUS, RESPONSE_MESSAGE } from "../../src/common/constants";
import { isNullOrEmpty, isTypeString } from "../../src/common/utils";
import * as AlbumController from "../../src/controllers/album.controller";
import * as jwtCore from "../../src/core/jwt";
import User from "../../src/models/user.model";

import { MOCK_ALBUM } from "./albumTestConfig";
import { MOCK_USER_INFO } from "./userTestConfig";

export interface TokenOptions {
  showToken: boolean;
  mockToken: boolean;
  isExpired: boolean;
  isInvalid: boolean;
  existUser: boolean;
}

const defaultTokenOptions: Required<TokenOptions> = {
  showToken: true,
  mockToken: true,
  existUser: true,
  isExpired: false,
  isInvalid: false
};

export interface FormDataSetOptions {
  attachFile: string;
  isSetFormData: boolean;
  isSetFolderId: boolean;
  invalidFolderId: boolean;
}

const defaultFormDataSetOptions: Required<FormDataSetOptions> = {
  attachFile: "19kb.png",
  isSetFormData: true,
  isSetFolderId: true,
  invalidFolderId: false
};

const BADREQUEST_MESSAGE_MAP = {
  CONTENT_TYPE: RESPONSE_MESSAGE.INVALID_CONTENT_TYPE,
  JSON_KEY: RESPONSE_MESSAGE.INVALID_JSON_KEY,
  JSON_FORMAT: RESPONSE_MESSAGE.INVALID_JSON_FORMAT,
  INVALID_ID: RESPONSE_MESSAGE.INVALID_ID,
  INVALID_CAPTCHA: RESPONSE_MESSAGE.INVALID_CAPTCHA,
  EXPIRED_CAPTCHA: RESPONSE_MESSAGE.EXPIRED_CAPTCHA,
  FILE_LIMIT: RESPONSE_MESSAGE.FILE_LIMIT,
  FOLDER_LIMIT: RESPONSE_MESSAGE.FOLDER_LIMIT,
  NO_FILE: RESPONSE_MESSAGE.NO_FILE,
  LIMIT_FORMAT: RESPONSE_MESSAGE.LIMIT_FORMAT,
} as const;

const UNAUTHORIZED_MESSAGE_MAP = {
  TOKEN_INVALID: RESPONSE_MESSAGE.TOKEN_INVALID,
  WRONG_PASSWORD: RESPONSE_MESSAGE.WRONG_PASSWORD
} as const;

export type BadRequestType = keyof typeof BADREQUEST_MESSAGE_MAP;
export type UnAuthorizedType = keyof typeof UNAUTHORIZED_MESSAGE_MAP;

const attachTokenCookie = (req: Request, options: TokenOptions): void => {
  if (!options.showToken) return;

  const payload = {
    user: options.existUser ? MOCK_USER_INFO.token : "notExistUser",
  };

  const signOptions: jwt.SignOptions = {};
  if (options.isExpired) signOptions.expiresIn = -1;

  const generateToken = jwt.sign(
    payload,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.JWT_SECRET!,
    signOptions
  );

  const token = options.mockToken ? MOCK_USER_INFO.token : generateToken;

  req.set("Cookie", [`token=${options.isInvalid ? "invalidtoken" : token}`]);
};

export const mockUserFindOne = (data: object | null = MOCK_USER_INFO): void => {
  (User.findOne as jest.Mock).mockResolvedValue(data);
};

export const mockUserFindById = (data: object | null = MOCK_USER_INFO): void => {
  (User.findById as jest.Mock).mockResolvedValue(data);
};

export const spyOnGetUserIdFromToken = (data: string | null = MOCK_USER_INFO._id): void => {
  jest.spyOn(jwtCore, "getUserIdFromToken").mockReturnValue(data);
};

export const spyOnGetAlbum = (error: boolean = false): void => {
  if (error) {
    jest.spyOn(AlbumController, "getAlbum").mockRejectedValue(new Error("getAlbum error"));
    return;
  }
  jest.spyOn(AlbumController, "getAlbum").mockResolvedValue(MOCK_ALBUM);
};

export const createRequest = {
  get: (
    route: string,
    status: number,
    TokenOptions?: Partial<TokenOptions>,
    isExpectJson: boolean = true
  ): request.Test => {
    const mergedTokenOptions = { ...defaultTokenOptions, ...TokenOptions };
    const expectContentType = isExpectJson ? CONTENT_TYPE.JSON_WITH_CHARSET : CONTENT_TYPE.TEXT_WITH_CHARSET;
    const req = request(app).get(route);

    attachTokenCookie(req, mergedTokenOptions);

    return req
      .expect("Content-Type", expectContentType)
      .expect(status);
  },

  post: (
    route: string,
    body: string | object,
    status: number,
    TokenOptions?: Partial<TokenOptions>,
    isSetJson: boolean = true,
    isExpectJson: boolean = true
  ): request.Test => {
    const mergedTokenOptions = { ...defaultTokenOptions, ...TokenOptions };
    const setContentType = isSetJson ? CONTENT_TYPE.JSON : CONTENT_TYPE.FORM_URLENCODED;
    const expectContentType = isExpectJson ? CONTENT_TYPE.JSON_WITH_CHARSET : CONTENT_TYPE.TEXT_WITH_CHARSET;
    const req = request(app)
      .post(route)
      .set("Content-Type", setContentType)
      .send(body);

    attachTokenCookie(req, mergedTokenOptions);
    
    return req
      .expect("Content-Type", expectContentType)
      .expect(status);
  },

  formDataPost: (
    route: string,
    status: number,
    setOptions?: Partial<FormDataSetOptions>,
    tokenOptions?: Partial<TokenOptions>
  ): request.Test => {
    const mergedTokenOptions = { ...defaultTokenOptions, ...tokenOptions };
    const mergedSetOptions = { ...defaultFormDataSetOptions, ...setOptions };
    const setContentType = mergedSetOptions.isSetFormData ? CONTENT_TYPE.FORM_DATA : CONTENT_TYPE.JSON;
    const req = request(app)
      .post(route)
      .set("Content-Type", setContentType);

    if (mergedSetOptions.isSetFormData) {
      if (mergedSetOptions.isSetFolderId) {
        const folderId = mergedSetOptions.invalidFolderId ? "invalid-id" : "507f1f77bcf86cd799439011";
        req.field("folderId", folderId);
      }

      if (!isNullOrEmpty(mergedSetOptions.attachFile)) {
        req.attach("files", path.join(__dirname, `../files/${mergedSetOptions.attachFile}`));
      }
    }

    attachTokenCookie(req, mergedTokenOptions);

    return req.expect(status);
  },

  patch: (
    route: string,
    body: string | object,
    status: number,
    TokenOptions?: Partial<TokenOptions>,
    isSetJson: boolean = true,
    isExpectJson: boolean = true
  ): request.Test => {
    const mergedTokenOptions = { ...defaultTokenOptions, ...TokenOptions };
    const setContentType = isSetJson ? CONTENT_TYPE.JSON : CONTENT_TYPE.FORM_URLENCODED;
    const expectContentType = isExpectJson ? CONTENT_TYPE.JSON_WITH_CHARSET : CONTENT_TYPE.TEXT_WITH_CHARSET;
    const req = request(app)
      .patch(route)
      .set("Content-Type", setContentType)
      .send(body);

    attachTokenCookie(req, mergedTokenOptions);

    return req
      .expect("Content-Type", expectContentType);
  },

  delete: (
    route: string,
    status: number,
    TokenOptions?: Partial<TokenOptions>,
    isExpectJson: boolean = true
  ): request.Test => {
    const mergedTokenOptions = { ...defaultTokenOptions, ...TokenOptions };
    const expectContentType = isExpectJson ? CONTENT_TYPE.JSON_WITH_CHARSET : CONTENT_TYPE.TEXT_WITH_CHARSET;
    const req = request(app).delete(route);

    attachTokenCookie(req, mergedTokenOptions);

    return req
      .expect("Content-Type", expectContentType)
      .expect(status);
  }
};

export const expectResponse = {
  success: (response: Response, data?: string | object): void => {
    if (isTypeString(data)) {
      expect(response.text).toBe(data);
    } else {
      expect(response.body).toEqual({
        status: HTTP_STATUS.OK,
        message: RESPONSE_MESSAGE.SUCCESS,
        data
      });
    }
  },

  created: (response: Response, data?: string | object): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.CREATED,
      message: RESPONSE_MESSAGE.SUCCESS,
      data
    });
  },

  badRequest: (response: Response, type: BadRequestType, data?: string | object, ): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.BAD_REQUEST,
      message: BADREQUEST_MESSAGE_MAP[type],
      data,
      errorType: type
    });
  },

  notFound: (response: Response, data: string | object): void => {
    if (isTypeString(data)) {
      expect(response.text).toBe(data);
    } else {
      expect(response.body).toEqual({
        status: HTTP_STATUS.NOT_FOUND,
        message: RESPONSE_MESSAGE.NOT_FOUND,
      });
    }
  },

  error: (response: Response): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.SERVER_ERROR,
      message: RESPONSE_MESSAGE.SERVER_ERROR
    });
  },

  unauthorized: (
    response: Response,
    type: UnAuthorizedType): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: UNAUTHORIZED_MESSAGE_MAP[type],
      errorType: type
    });
  },

  conflict: (response: Response, message: string = RESPONSE_MESSAGE.DATA_ALREADY_EXISTS): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.CONFLICT,
      message: message
    });
  },

  payloadTooLarge(response: Response): void {
    expect(response.body).toEqual({
      status: HTTP_STATUS.PAYLOAD_TOO_LARGE,
      message: RESPONSE_MESSAGE.LIMIT_FILE_SIZE
    });
  },

  tooManyRequests: (response: Response): void => {
    expect(response.body).toEqual({
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: RESPONSE_MESSAGE.TOO_MANY_REQUESTS
    });
  }
};
