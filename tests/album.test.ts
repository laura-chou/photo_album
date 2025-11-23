import { HTTP_STATUS } from "../src/common/constants";
import * as FileUpload from "../src/core/file-upload";
import Album from "../src/models/album.model";
import User from "../src/models/user.model";

import { MOCK_EXPECTED_ALBUM, MOCK_CREATE_DATA, MOCK_DELETE_FOLDER_DATA,
  MOCK_DELETE_INVALID_DATA, MOCK_UPDATE_DATA, ROUTE } from "./fixtures/albumTestConfig";
import { describeAuthErrorTests, describeServerErrorTests, describeReqBodyValidationTests, describeParamsIdValidationTest, describeTokenUserIdValidationTest } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindById, spyOnGetUserIdFromToken, spyOnGetAlbum } from "./fixtures/testUtils";

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn()
}));

jest.mock("../src/models/album.model", () => ({
  updateOne: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

const mockAlbumFindOne = (data: object | null | Error = { folder: [], save: jest.fn() }): void => {
  (Album.findOne as jest.Mock).mockResolvedValueOnce(data);
};

describe("Album API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe(`PATCH ${ROUTE.ALBUM}/:folderId`, () => {
    const route = `${ROUTE.ALBUM}/507f1f77bcf86cd799439011`;

    describeAuthErrorTests(
      route,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describeReqBodyValidationTests(
      {
        route: route,
        validBody: MOCK_UPDATE_DATA,
        requestFn: createRequest.patch,
      },
      expectResponse
    );

    describeParamsIdValidationTest(
      `${ROUTE.ALBUM}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse,
      "Action Rename Validation Id Parameter"
    );

    describeParamsIdValidationTest(
      `${ROUTE.ALBUM}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_DELETE_INVALID_DATA, status, tokenInfo),
      expectResponse,
      "Action Delete Validation Id Parameter"
    );

    describeTokenUserIdValidationTest(
      route,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse
    );

    describe("Validation Error Cases", () => {
      test("should return 400 if total folder exceed 5", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        mockAlbumFindOne({ folder: [{}, {}, {}, {}, {}] });

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.BAD_REQUEST
        );

        expectResponse.badRequest(response, "FOLDER_LIMIT");
      });
    });

    describe("Success Cases", () => {
      beforeEach(() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        spyOnGetAlbum();
      });

      test("should create a new folder when action is 'create' and user is exist", async() => {
        mockAlbumFindOne();

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should create a new album when action is 'create' and user is not exist", async() => {
        mockAlbumFindOne(null);

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should rename a folder when action is 'rename'", async() => {
        const response = await createRequest.patch(
          route,
          MOCK_UPDATE_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should delete a folder when action is 'delete'", async() => {
        const response = await createRequest.patch(
          route,
          MOCK_DELETE_FOLDER_DATA,
          HTTP_STATUS.OK
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });
    });

    describeServerErrorTests(
      {
        route: route,
        requestFn: createRequest.patch,
        requestBody: MOCK_CREATE_DATA,
        dbErrorCases: [
          {
            name: "User.findById",
            mockFn: User.findById as jest.Mock
          },
          {
            name: "Album.findOne",
            mockFn: Album.findOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
            }
          },
          {
            name: "Album.save",
            mockFn: Album.findOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              (Album.findOne as jest.Mock).mockResolvedValue({
                folder: [],
                save: jest.fn().mockRejectedValue(new Error("DB error"))
              });
            }
          },
          {
            name: "Album.create",
            mockFn: Album.create as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumFindOne(null);
            }
          },
          {
            name: "getAlbum",
            mockFn: jest.fn(),
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumFindOne(null);
              spyOnGetAlbum(true);
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
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
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
        requestBody: MOCK_DELETE_FOLDER_DATA,
        dbErrorCases: [
          {
            name: "Album.updateOne",
            mockFn: Album.updateOne as jest.Mock,
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
            }
          },
          {
            name: "deleteFromFTP",
            mockFn: jest.fn(),
            setupMocks: (): void => {
              mockUserFindById();
              spyOnGetUserIdFromToken();
              mockAlbumFindOne(null);
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
