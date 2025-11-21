import fsPromises from "fs/promises";
import path from "path";

import express, { Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../src/common/constants";
import * as FileUpload from "../src/core/file-upload";
import Album from "../src/models/album.model";
import User from "../src/models/user.model";

import { MOCK_EXPECTED_ALBUM } from "./fixtures/albumTestConfig";
import { MOCK_ALBUMAGGRE, MOCK_DELETE_DATA, MOCK_UPDATE_DATA, ROUTE } from "./fixtures/fileTestConfig";
import { describeAuthErrorTests, describeTokenUserIdValidationTest, describeServerErrorTests, describeParamsIdValidationTest, describeReqBodyValidationTests } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindById, spyOnGetAlbum, spyOnGetUserIdFromToken } from "./fixtures/testUtils";
import { MOCK_USER_INFO } from "./fixtures/userTestConfig";

jest.mock("fs/promises");

jest.mock("uuid");

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
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

const mockUuid = (): void => {
  (uuidv4 as jest.Mock).mockReturnValue("unique-file-identifier");
};

const mockAlbumAggre = (data: object = [MOCK_ALBUMAGGRE]): void => {
  (Album.aggregate as jest.Mock).mockResolvedValue(data);
};

const spyOnUploadToFTP = (error: boolean = false): void => {
  if (error) {
    jest.spyOn(FileUpload, "uploadToFTP").mockRejectedValue(new Error("uploadToFTP error"));
    return;
  }
  jest.spyOn(FileUpload, "uploadToFTP").mockResolvedValue();
};

describe("File API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    process.env.FTP_HOST = "ftp.example.com";
    process.env.FTP_USER = "ftp-user";
  });

  describe(`GET ${ROUTE.FILE}/:fileName`, () => {
    const route = `${ROUTE.FILE}/photo.jpg`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.get(route, status, tokenInfo),
      expectResponse
    );

    describeTokenUserIdValidationTest(
      route,
      (route, status) => createRequest.get(route, status),
      expectResponse
    );

    describe("Success Cases", () => {
      beforeEach(() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
      });

      test("should send local image if PRD_ENV is false and file exists", async() => {
        process.env.PRD_ENV = "false";
        (fsPromises.access as jest.Mock).mockResolvedValue(undefined);
        spyOnSendFile();

        await createRequest.get(
          route,
          HTTP_STATUS.OK,
          {},
          false
        );

        const expectedPath = path.join(process.cwd(), "photo-album", MOCK_USER_INFO._id, "photo.jpg");
        expect(fsPromises.access).toHaveBeenCalledWith(expectedPath);
      });

      test("should redirect to FTP URL if PRD_ENV is true", async() => {
        process.env.PRD_ENV = "true";

        const response = await createRequest.get(
          route,
          HTTP_STATUS.FOUND,
          {},
          false
        );
        const expectedPath = `http://ftp.example.com/ftp-user/photo-album/${MOCK_USER_INFO._id}/photo.jpg`;
        expect(response.headers.location).toBe(expectedPath);
      });
    });

    describe("Client Error Cases", () => {
      test("should return 404 if local image does not exist", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        process.env.PRD_ENV = "false";
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
      beforeEach(() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
      });

      test("should fail when uploading a non-image file", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST,
          { attachFile: "test.txt" }
        );

        expectResponse.badRequest(response, "LIMIT_FORMAT");
      });

      test("should fail when file size exceeds limit", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
          { attachFile: "1mb.png" }
        );

        expectResponse.payloadTooLarge(response);
      });
    });

    describe("Not Found Cases", () => {
      test("should return 404 when folder not found", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        mockAlbumAggre([]);

        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.NOT_FOUND);
        expectResponse.notFound(response, []);
      });
    });

    describe("Validation Error Cases", () => {
      beforeEach(() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
      });

      test("should return 400 for invalid Content-Type", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST,
          { isSetFormData: false }
        );
        expectResponse.badRequest(response, "CONTENT_TYPE");
      });

      test("should return 400 if no files uploaded", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST,
          { attachFile: "" }
        );

        expectResponse.badRequest(response, "NO_FILE");
      });

      test("should return 400 if no folderId", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST,
          { isSetFolderId: false }
        );

        expectResponse.badRequest(response, "JSON_KEY");
      });

      test("should return 400 if Id format is invalid", async() => {
        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST,
          { invalidFolderId: true }
        );

        expectResponse.badRequest(response, "INVALID_ID");
      });

      test("should return 400 if total files exceed 5", async() => {
        mockAlbumAggre([{ fileCount: 5 }]);

        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.BAD_REQUEST
        );

        expectResponse.badRequest(response, "FILE_LIMIT");
      });
    });

    describeTokenUserIdValidationTest(
      ROUTE.UPLOAD,
      (route, status) => createRequest.formDataPost(route, status),
      expectResponse
    );

    describe("Success Cases", () => {
      test("should upload files successfully", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        mockAlbumAggre([{ fileCount: 1 }]);
        mockUuid();
        spyOnUploadToFTP();
        spyOnGetAlbum();

        const response = await createRequest.formDataPost(
          ROUTE.UPLOAD,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });
    });

    describeServerErrorTests(
      {
        route: ROUTE.UPLOAD,
        requestFn: createRequest.formDataPost,
        dbErrorCases: [
          {
            name: "User.findById",
            mockFn: User.findById as jest.Mock
          },
          {
            name: "Album.aggregate",
            mockFn: Album.aggregate as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
            }
          },
          {
            name: "uploadToFTP",
            mockFn: jest.fn(),
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre([{ fileCount: 1 }]);
              mockUuid();
              spyOnUploadToFTP(true);
            }
          },
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre([{ fileCount: 1 }]);
              mockUuid();
              spyOnUploadToFTP();
            }
          }
        ]
      },
      expectResponse
    );
  });

  describe(`PATCH ${ROUTE.FILE}/:fileId`, () => {
    const route = `${ROUTE.FILE}/507f1f77bcf86cd799439013`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describeParamsIdValidationTest(
      `${ROUTE.FILE}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse,
      "Validation Parameter Id",
      true
    );

    describeReqBodyValidationTests(
      {
        route: route,
        validBody: MOCK_UPDATE_DATA,
        requestFn: createRequest.patch,
      },
      expectResponse
    );

    describeTokenUserIdValidationTest(
      route,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describe("Not Found Cases", () => {
      test("should return 404 when folder not found", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        mockAlbumAggre([]);

        const response = await createRequest.patch(
          route,
          MOCK_UPDATE_DATA,
          HTTP_STATUS.NOT_FOUND);
        expectResponse.notFound(response, []);
      });
    });

    describe("Success Cases", () => {
      beforeEach(() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        mockAlbumAggre();
        spyOnGetAlbum();
      });

      test("should rename file name when action is 'rename'", async() => {
        const response = await createRequest.patch(
          route,
          MOCK_UPDATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should delete file when action is 'delete'", async() => {
        const response = await createRequest.patch(
          route,
          MOCK_DELETE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });
    });

    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.patch,
        requestBody: MOCK_UPDATE_DATA,
        dbErrorCases: [
          {
            name: "User.findById",
            mockFn: User.findById as jest.Mock
          },
          {
            name: "Album.aggregate",
            mockFn: Album.aggregate as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
            }
          },
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre();
            }
          },
          {
            name: "getAlbum",
            mockFn: jest.fn(),
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre();
              spyOnGetAlbum(true);
            }
          }
        ]
      },
      expectResponse,
      "Action Rename Server Error Cases"
    );

    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.patch,
        requestBody: MOCK_DELETE_DATA,
        dbErrorCases: [
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre();
            }
          },
          {
            name: "deleteFromFTP",
            mockFn: jest.fn(),
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumAggre();
              jest.spyOn(FileUpload, "deleteFromFTP").mockRejectedValue(new Error("deleteFromFTP error"));
            }
          }
        ]
      },
      expectResponse,
      "Action Delete Server Error Cases"
    );
  });
});