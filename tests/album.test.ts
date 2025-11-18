import { HTTP_STATUS } from "../src/common/constants";
import * as AlbumController from "../src/controllers/album.controller";
import Album from "../src/models/album.model";

import { MOCK_ALBUM, MOCK_EXPECTED_ALBUM, MOCK_CREATE_DATA,
  MOCK_DELETE_FOLDER_DATA, MOCK_DELETE_INVALID_DATA,
  MOCK_UPDATE_DATA, ROUTE } from "./fixtures/albumTestConfig";
import { describeAuthErrorTests, describeServerErrorTests, describeValidationErrorTests, describeValidationParamsIdTest } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindById, spyOnGetUserIdFromToken } from "./fixtures/testUtils";

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

    describeValidationErrorTests(
      {
        route: route,
        validBody: MOCK_UPDATE_DATA,
        requestFn: createRequest.patch,
      },
      expectResponse
    );

    describeValidationParamsIdTest(
      `${ROUTE.ALBUM}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_UPDATE_DATA, status, tokenInfo),
      expectResponse,
      "Action Rename Validation Id Parameter"
    );

    describeValidationParamsIdTest(
      `${ROUTE.ALBUM}/invalid-id`,
      (route, status, tokenInfo) => createRequest.patch(route, MOCK_DELETE_INVALID_DATA, status, tokenInfo),
      expectResponse,
      "Action Delete Validation Id Parameter"
    );
    
    describe("Success Cases", () => {
      test("should create a new folder when action is 'create' and user is exist", async() => {
        mockUserFindById();
        (Album.findOne as jest.Mock).mockResolvedValue({ folder: [], save: jest.fn() });
        jest.spyOn(AlbumController, "getAlbum").mockResolvedValue(MOCK_ALBUM);


        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK,
          { mockToken: true }
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should create a new album when action is 'create' and user is not exist", async() => {
        mockUserFindById();
        (Album.findOne as jest.Mock).mockResolvedValue(null);
        jest.spyOn(AlbumController, "getAlbum").mockResolvedValue(MOCK_ALBUM);

        const response = await createRequest.patch(
          route,
          MOCK_CREATE_DATA,
          HTTP_STATUS.OK,
          { mockToken: true }
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should rename a folder when action is 'rename'", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        jest.spyOn(AlbumController, "getAlbum").mockResolvedValue(MOCK_ALBUM);

        const response = await createRequest.patch(
          route,
          MOCK_UPDATE_DATA,
          HTTP_STATUS.OK,
          { mockToken: true }
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });

      test("should delete a folder when action is 'delete'", async() => {
        mockUserFindById();
        spyOnGetUserIdFromToken();
        jest.spyOn(AlbumController, "getAlbum").mockResolvedValue(MOCK_ALBUM);

        const response = await createRequest.patch(
          route,
          MOCK_DELETE_FOLDER_DATA,
          HTTP_STATUS.OK,
          { mockToken: true }
        );

        expectResponse.success(response, MOCK_EXPECTED_ALBUM);
      });
    });

    // describeServerErrorTests(
    //   {
    //     route: route,
    //     requestFn: createRequest.patch,
    //     requestBody: MOCK_CREATE_DATA,
    //     dbErrorCases: [
    //       {
    //         name: "first User.findOne",
    //         mockFn: User.findOne as jest.Mock
    //       },
    //       {
    //         name: "second User.findOne",
    //         mockFn: User.findOne as jest.Mock,
    //         setupMocks: (): void => {
    //           const chainMock = {
    //             select: jest.fn().mockReturnThis(),
    //             lean: jest.fn().mockReturnThis(),
    //             then: jest.fn(() => {
    //               throw new Error("DB error");
    //             }),
    //           };

    //           const mock = User.findOne as jest.Mock;
    //           mock.mockResolvedValueOnce(MOCK_USER_INFO);
    //           mock.mockImplementationOnce(() => chainMock);
    //           mock.mockRejectedValueOnce(new Error("DB error"));
    //         }
    //       },
    //       {
    //         name: "Album.findOne",
    //         mockFn: Album.findOne as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOneOnceAndChain();
    //         }
    //       },
    //       {
    //         name: "Album.save",
    //         mockFn: Album.findOne as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOneOnceAndChain();
    //           const mockSave = jest.fn().mockRejectedValue(new Error("DB error"));
    //           const mockAlbum = { folder: [], save: mockSave };
    //           (Album.findOne as jest.Mock).mockResolvedValue(mockAlbum);
    //           (Album.findOne as jest.Mock).mockRejectedValueOnce = jest.fn();
    //         }
    //       },
    //       {
    //         name: "Album.create",
    //         mockFn: Album.create as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOneOnceAndChain();
    //           (Album.findOne as jest.Mock).mockResolvedValue(null);
    //         }
    //       }
    //     ]
    //   },
    //   expectResponse,
    //   "Action Create Server Error Cases"
    // );
    
    // describeServerErrorTests(
    //   {
    //     route: route,
    //     requestFn: createRequest.patch,
    //     requestBody: MOCK_UPDATE_DATA,
    //     dbErrorCases: [
    //       {
    //         name: "User.findOne",
    //         mockFn: User.findOne as jest.Mock
    //       },
    //       {
    //         name: "Album.updateOne",
    //         mockFn: Album.updateOne as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOne();
    //         }
    //       }
    //     ]
    //   },
    //   expectResponse,
    //   "Action Rename Server Error Cases"
    // );

    // describeServerErrorTests(
    //   {
    //     route: route,
    //     requestFn: createRequest.patch,
    //     requestBody: MOCK_DELETE_FOLDER_DATA,
    //     dbErrorCases: [
    //       {
    //         name: "User.findOne",
    //         mockFn: User.findOne as jest.Mock
    //       },
    //       {
    //         name: "Album.updateOne",
    //         mockFn: Album.updateOne as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOne();
    //         }
    //       }
    //     ]
    //   },
    //   expectResponse,
    //   "Action Delete Folder Server Error Cases"
    // );

    // describeServerErrorTests(
    //   {
    //     route: route,
    //     requestFn: createRequest.patch,
    //     requestBody: MOCK_DELETE_FILE_DATA,
    //     dbErrorCases: [
    //       {
    //         name: "Album.aggregate",
    //         mockFn: Album.aggregate as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOne();
    //         }
    //       },
    //       {
    //         name: "Album.updateOne",
    //         mockFn: Album.updateOne as jest.Mock,
    //         setupMocks: (): void => {
    //           mockUserFindOne();
    //           mockAlbumAggregate(MOCK_FILE);
    //         }
    //       }
    //     ]
    //   },
    //   expectResponse,
    //   "Action Delete File Server Error Cases"
    // );
  });
});
