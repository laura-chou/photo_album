import fs from "fs/promises";
import path from "path";

import express, { Response } from "express";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../src/common/constants";
import Album from "../src/models/album.model";
import User from "../src/models/user.model";

import { MOCK_ALBUM, MOCK_CREATE_DATA, MOCK_DELETE_DATA, MOCK_UPDATE_DATA, ROUTE } from "./fixtures/albumTestConfig";
import { describeAuthErrorTests, describeServerErrorTests, describeValidationErrorTests, describeValidationParamsIdTest } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindOne, mockUserFindOneOnceAndChain } from "./fixtures/testUtils";
import { MOCK_USER_INFO } from "./fixtures/userTestConfig";

jest.mock("fs/promises");

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock("../src/models/album.model", () => ({
  updateOne: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

const spyOnSendFile = (): void => {
  jest.spyOn(express.response, "sendFile").mockImplementation(function(this: Response, filePath: string) {
    this.statusCode = 200;
    this.type("html");
    this.send(filePath);
  });
};

const mockUserAggregate = (data: Array<object>): void => {
  (User.aggregate as jest.Mock).mockResolvedValue(data);
};

describe("Album API", () => {
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
        (fs.access as jest.Mock).mockResolvedValue(undefined);
        spyOnSendFile();

        await createRequest.get(
          route,
          HTTP_STATUS.OK,
          {},
          false
        );

        const expectedPath = path.join(process.cwd(), "images", "photo.jpg");
        expect(fs.access).toHaveBeenCalledWith(expectedPath);
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
        (fs.access as jest.Mock).mockRejectedValue(new Error("not found"));

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

  describe(`GET ${ROUTE.ALBUM}/:userName`, () => {
    const route = `${ROUTE.ALBUM}/userName`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.get(route, status, tokenInfo),
      expectResponse
    );

    describe("Success Cases", () => {
      test("should return user album data with valid JWT", async() => {
        mockUserFindOne();
        mockUserAggregate(MOCK_ALBUM);

        const response = await createRequest.get(route, HTTP_STATUS.OK);
        expectResponse.success(response, MOCK_ALBUM);
      });

      test("should return empty data when no data found", async() => {
        mockUserFindOne();
        mockUserAggregate([]);

        const response = await createRequest.get(route, HTTP_STATUS.OK);
        expectResponse.success(response, []);
      });
    });

    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.get,
        dbErrorCases: [
          {
            name: "User.findOne",
            mockFn: User.findOne as jest.Mock
          },
          {
            name: "User.aggregate",
            mockFn: User.aggregate as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
            }
          }
        ]
      },
      expectResponse
    );
  });

  describe(`PATCH ${ROUTE.UPDATE}/:folderId`, () => {
    const route = `${ROUTE.UPDATE}/507f1f77bcf86cd799439011`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describeValidationErrorTests(
      {
        route: route,
        validBody: MOCK_UPDATE_DATA,
        requestFn: createRequest.patch
      },
      expectResponse
    );

    describeValidationParamsIdTest(
      `${ROUTE.UPDATE}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describe("Success Cases", () => {
      test("should create a new folder when action is 'create' and user is exist", async() => {
        mockUserFindOneOnceAndChain();
        (Album.findOne as jest.Mock).mockResolvedValue({
          folder: [],
          save: jest.fn()
        });

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.updated(response);
      });

      test("should create a new album when action is 'create' and user is not exist", async() => {
        mockUserFindOneOnceAndChain();
        (Album.findOne as jest.Mock).mockResolvedValue(null);

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.updated(response);
      });

      test("should rename a folder when action is 'rename'", async() => {
        mockUserFindOne();

        const response = await createRequest.patch(
          route,
          MOCK_UPDATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.updated(response);
      });
    });

    test("should delete a folder when action is 'delete'", async() => {
      mockUserFindOne();

      const response = await createRequest.patch(
        route,
        MOCK_DELETE_DATA,
        HTTP_STATUS.OK
      );

      expectResponse.updated(response);
    });

    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.patch,
        requestBody: MOCK_CREATE_DATA,
        dbErrorCases: [
          {
            name: "first User.findOne",
            mockFn: User.findOne as jest.Mock
          },
          {
            name: "second User.findOne",
            mockFn: User.findOne as jest.Mock,
            setupMocks: (): void => {
              const chainMock = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                then: jest.fn(() => {
                  throw new Error("DB error");
                }),
              };

              const mock = User.findOne as jest.Mock;
              mock.mockResolvedValueOnce(MOCK_USER_INFO);
              mock.mockImplementationOnce(() => chainMock);
              mock.mockRejectedValueOnce(new Error("DB error"));
            }
          },
          {
            name: "Album.findOne",
            mockFn: Album.findOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
            }
          },
          {
            name: "Album.save",
            mockFn: Album.findOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
              const mockSave = jest.fn().mockRejectedValue(new Error("DB error"));
              const mockAlbum = { folder: [], save: mockSave };
              (Album.findOne as jest.Mock).mockResolvedValue(mockAlbum);
              (Album.findOne as jest.Mock).mockRejectedValueOnce = jest.fn();
            }
          },
          {
            name: "Album.create",
            mockFn: Album.create as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
              (Album.findOne as jest.Mock).mockResolvedValue(null);
            }
          }
        ]
      },
      expectResponse,
      "Action Create Server Error Cases"
    );
    
    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.patch,
        requestBody: MOCK_UPDATE_DATA,
        dbErrorCases: [
          {
            name: "User.findOne",
            mockFn: User.findOne as jest.Mock
          },
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
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
            name: "User.findOne",
            mockFn: User.findOne as jest.Mock
          },
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne();
            }
          }
        ]
      },
      expectResponse,
      "Action Delete Server Error Cases"
    );
  });
});
