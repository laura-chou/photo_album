import fsPromises from "fs/promises";
import path from "path";

import express, { Response } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";


import app from "../src/app";
import { HTTP_STATUS, RESPONSE_MESSAGE } from "../src/common/constants";
import * as fileUpload from "../src/core/file-upload";
import Album from "../src/models/album.model";
import User from "../src/models/user.model";

import { ROUTE } from "./fixtures/fileTestConfig";
import { describeAuthErrorTests } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindOne } from "./fixtures/testUtils";

jest.mock("fs/promises");

jest.mock("uuid");

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  updateOne: jest.fn()
}));

jest.mock("../src/models/album.model", () => ({
  aggregate: jest.fn(),
  updateOne: jest.fn()
}));

const spyOnSendFile = (): void => {
  jest.spyOn(express.response, "sendFile").mockImplementation(function(this: Response, filePath: string) {
    this.statusCode = 200;
    this.type("html");
    this.send(filePath);
  });
};

const token = jwt.sign(
  { user: "testuser" },
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.JWT_SECRET!,
  { expiresIn: "1h" }
);

describe("File API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    process.env.FTP_HOST = "ftp.example.com";
    process.env.FTP_USER = "user";
  });

  describe(`GET ${ROUTE.FILE}/:fileName`, () => {
    const route = `${ROUTE.FILE}/photo.jpg`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.get(route, status, tokenInfo),
      expectResponse
    );

    describe("Success Cases", () => {
      test("should send local image if UPLOAD_FTP is true and file exists", async() => {
        mockUserFindOne();
        process.env.UPLOAD_FTP = "true";
        (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
        spyOnSendFile();

        await createRequest.get(
          route,
          HTTP_STATUS.OK,
          {},
          false
        );

        const expectedPath = path.join(process.cwd(), "images", "photo.jpg");
        expect(fsPromises.access).toHaveBeenCalledWith(expectedPath);
      });

      test("should redirect to FTP URL if UPLOAD_FTP is false", async() => {
        mockUserFindOne();
        process.env.UPLOAD_FTP = "false";

        const response = await createRequest.get(
          route,
          HTTP_STATUS.FOUND,
          {},
          false
        );

        expect(response.headers.location).toBe("http://ftp.example.com/user/photo.jpg");
      });
    });

    describe("Client Error Cases", () => {
      test("should return 404 if local image does not exist", async() => {
        mockUserFindOne();
        process.env.UPLOAD_FTP = "true";
        (fsPromises.access as jest.Mock).mockRejectedValue(new Error("not found"));

        const response = await createRequest.get(
          route,
          HTTP_STATUS.NOT_FOUND,
          {},
          false
        );

        expectResponse.notFound(response, RESPONSE_MESSAGE.NOT_FOUND);
      });
    });
  });

  describe(`POST ${ROUTE.UPLOAD}`, () => {
    describeAuthErrorTests(
      ROUTE.UPLOAD,
      (route, status, tokenInfo) => createRequest.post(route, "", status, tokenInfo),
      expectResponse
    );

    describe("Multer Upload Error Cases", () => {
      test("should fail when uploading a non-image file", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .attach("file", path.join(__dirname, "files/test.txt"));

        expectResponse.badRequest(response, RESPONSE_MESSAGE.LIMIT_FORMAT);
      });

      test("should fail when file size exceeds limit", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .attach("file", path.join(__dirname, "files/1mb.png"));

        expectResponse.payloadTooLarge(response);
      });
    });
    
    describe("Validation Error Cases", () => {
      test("should return bad request for invalid Content-Type", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .send({});
        
        expectResponse.badRequest(response, RESPONSE_MESSAGE.INVALID_CONTENT_TYPE);
      });

      test("should return bad request if no files uploaded", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011");
        
        expectResponse.badRequest(response, RESPONSE_MESSAGE.NO_FILE);
      });

      test("should return bad request if no folderId", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .attach("file", path.join(__dirname, "files/19kb.png"));

        expectResponse.badRequest(response, RESPONSE_MESSAGE.INVALID_JSON_KEY);
      });

      test("should return bad request if Id format is invalid", async() => {
        mockUserFindOne();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "invalid-id")
          .attach("file", path.join(__dirname, "files/19kb.png"));

        expectResponse.badRequest(response, RESPONSE_MESSAGE.INVALID_ID);
      });

      test("should return bad request if total files exceed 3", async() => {
        mockUserFindOne();
        (Album.aggregate as jest.Mock).mockResolvedValue([{ fileCount: 2 }]);

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"))
          .attach("file", path.join(__dirname, "files/19kb.png"));

        expectResponse.badRequest(response, RESPONSE_MESSAGE.UPLOAD_LIMIT);
      });
    });

    describe("Success Cases", () => {
      test("should upload files successfully", async() => {
        mockUserFindOne();
        (Album.aggregate as jest.Mock).mockResolvedValue([{ fileCount: 1 }]);
        (uuidv4 as jest.Mock).mockReturnValueOnce("uuid1");
        jest.spyOn(fileUpload, "uploadToFTP").mockResolvedValue();

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"));

        expectResponse.updated(response);
      });
    });

    describe("Server Error Cases", () => {
      test("should return 500 if User.findOne throws error", async() => {
        (User.findOne as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"));
        
        expectResponse.error(response);
      });

      test("should return 500 if Album.aggregate throws error", async() => {
        mockUserFindOne();
        (Album.aggregate as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"));
        
        expectResponse.error(response);
      });

      test("should return 500 if uploadToFTP throws error", async() => {
        mockUserFindOne();
        (Album.aggregate as jest.Mock).mockResolvedValue([{ fileCount: 1 }]);
        (uuidv4 as jest.Mock).mockReturnValueOnce("uuid1");
        jest.spyOn(fileUpload, "uploadToFTP").mockRejectedValueOnce(new Error("upload fail"));

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"));
        
        expectResponse.error(response);
      });

      test("should return 500 if Album.updateOne throws error", async() => {
        mockUserFindOne();
        (Album.aggregate as jest.Mock).mockResolvedValue([{ fileCount: 1 }]);
        (uuidv4 as jest.Mock).mockReturnValueOnce("uuid1");
        jest.spyOn(fileUpload, "uploadToFTP").mockResolvedValue();
        (Album.updateOne as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));

        const response = await request(app)
          .post(ROUTE.UPLOAD)
          .set("Authorization", `Bearer ${token}`)
          .field("folderId", "507f1f77bcf86cd799439011")
          .attach("file", path.join(__dirname, "files/19kb.png"));

        expectResponse.error(response);
      });
    });
  });
});