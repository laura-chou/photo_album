import fs from "fs/promises";
import path from "path";

import express, { Response } from "express";

import { HTTP_STATUS, RESPONSE_MESSAGE } from "../src/common/constants";
import User from "../src/models/user.model";

import { MOCK_ALBUM, ROUTE } from "./fixtures/albumTestConfig";
import { describeAuthErrorTests, describeServerErrorTests } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindOne } from "./fixtures/testUtils";

jest.mock("fs/promises");

jest.spyOn(express.response, "sendFile").mockImplementation(function(this: Response, filePath: string) {
  this.statusCode = 200;
  this.type("html");
  this.send(filePath);
});

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn()
}));

const mockUserAggregate = (data: Array<object>): void => {
  (User.aggregate as jest.Mock).mockResolvedValue(data);
};


describe("Album API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FTP_HOST = "ftp.example.com";
    process.env.FTP_USER = "user";
  });

  describe(`GET ${ROUTE.FILE}/:name`, () => {
    describeAuthErrorTests(
      `${ROUTE.FILE}/photo.jpg`,
      (route, status, tokenInfo) => createRequest.get(route, status, tokenInfo),
      expectResponse
    );

    describe("Success Cases", () => {
      test("should send local image if UPLOAD_FTP is true and file exists", async() => {
        mockUserFindOne();
        process.env.UPLOAD_FTP = "true";
        (fs.access as jest.Mock).mockResolvedValue(undefined);

        await createRequest.get(
          `${ROUTE.FILE}/photo.jpg`,
          HTTP_STATUS.OK,
          {},
          false
        );

        const expectedPath = path.join(process.cwd(), "images", "photo.jpg");
        expect(fs.access).toHaveBeenCalledWith(expectedPath);
      });

      test("should redirect to FTP URL if UPLOAD_FTP is false", async() => {
        process.env.UPLOAD_FTP = "false";

        const response = await createRequest.get(
          `${ROUTE.FILE}/remote.jpg`,
          HTTP_STATUS.FOUND,
          {},
          false
        );

        expect(response.headers.location).toBe("http://ftp.example.com/user/remote.jpg");
      });
    });

    describe("Client Error Cases", () => {
      test("should return 404 if local image does not exist", async() => {
        process.env.UPLOAD_FTP = "true";
        (fs.access as jest.Mock).mockRejectedValue(new Error("not found"));

        const response = await createRequest.get(
          `${ROUTE.FILE}/missing.jpg`,
          HTTP_STATUS.NOT_FOUND,
          {},
          false
        );

        expectResponse.notFound(response, RESPONSE_MESSAGE.NOT_FOUND);
      });
    });
  });

  describe(`GET ${ROUTE.ALBUM}/:user`, () => {
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
});
