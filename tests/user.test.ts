import svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";

import { HTTP_STATUS } from "../src/common/constants";
import * as utils from "../src/common/utils";
import { setCaptcha } from "../src/core/captcha";
import User from "../src/models/user.model";

import { describeServerErrorTests, describeValidationErrorTests } from "./fixtures/testStructures";
import { createRequest, expectResponse, mockUserFindOne } from "./fixtures/testUtils";
import { ROUTE, MOCK_USER_INFO, MOCK_REGISTER_EXIST_USER, MOCK_REGISTER_NOTEXIST_USER, MOCK_LOGIN_NOTEXIST_USER, MOCK_LOGIN_EXIST_USER } from "./fixtures/userTestConfig";


jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("../src/models/user.model", () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn()
}));

const spyOnGetClientIp = (ip: string): void => {
  jest.spyOn(utils, "getClientIp").mockReturnValue(ip);
};

describe("User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${ROUTE.CAPTCHA}`, () => {
    describe("Success Cases", () => {
      test("should return captcha svg and id when rate limit is not exceeded", async() => {
        spyOnGetClientIp("127.0.0.1");
        jest.spyOn(svgCaptcha, "create").mockReturnValue({
          text: "abcd",
          data: "<svg>captcha</svg>",
        });
        (uuidv4 as jest.Mock).mockReturnValue("test-id");

        const response = await createRequest.get(
          ROUTE.CAPTCHA,
          HTTP_STATUS.OK,
          {
            showToken: false
          }
        );

        expectResponse.success(response, {
          captchaId: "test-id",
          svg: "<svg>captcha</svg>"
        });
      });
    });

    describe("Validation Error Cases", () => {
      test("should return too many requests when rate limit is exceeded", async() => {
        spyOnGetClientIp("127.0.0.1");

        const response = await createRequest.get(
          ROUTE.CAPTCHA,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          {
            showToken: false
          }
        );

        expectResponse.tooManyRequests(response);
      });
    });

    describe("Server Error Cases", () => {
      test("should return 500 if svgCaptcha.create throws error", async() => {
        spyOnGetClientIp("127.0.0.2");
        jest.spyOn(svgCaptcha, "create").mockImplementation(() => {
          throw new Error("Captcha generation failed");
        });

        const response = await createRequest.get(
          ROUTE.CAPTCHA,
          HTTP_STATUS.SERVER_ERROR,
          {
            showToken: false
          }
        );

        expectResponse.error(response);
      });
    });
  });

  describe(`POST ${ROUTE.LOGIN}`, () => {
    describeValidationErrorTests(
      {
        route: ROUTE.LOGIN,
        validBody: MOCK_LOGIN_EXIST_USER,
        requestFn: createRequest.post
      },
      expectResponse
    );

    describe("Authentication Error Cases", () => {
      test("should fail if user does not exist", async() => {
        mockUserFindOne(null);
        
        const response = await createRequest.post(
          ROUTE.LOGIN,
          MOCK_LOGIN_NOTEXIST_USER,
          HTTP_STATUS.UNAUTHORIZED
        );
    
        expectResponse.unauthorized(response);
      });

      it("should fail if password is incorrect", async() => {
        mockUserFindOne(MOCK_USER_INFO);

        const response = await createRequest.post(
          ROUTE.LOGIN,
          MOCK_LOGIN_NOTEXIST_USER,
          HTTP_STATUS.UNAUTHORIZED
        );

        expectResponse.unauthorized(response);
      });
    });

    describe("Success Cases", () => {
      test("should login successfully and return a token", async() => {
        mockUserFindOne();

        const response = await createRequest.post(
          ROUTE.LOGIN,
          MOCK_LOGIN_EXIST_USER,
          HTTP_STATUS.OK
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty("token");
      });
    });

    describeServerErrorTests(
      {
        route: ROUTE.LOGIN,
        requestFn: createRequest.post,
        requestBody: MOCK_LOGIN_EXIST_USER,
        dbErrorCases: [
          {
            name: "User.findOne",
            mockFn: User.findOne as jest.Mock
          }
        ]
      },
      expectResponse
    );
  });

  describe(`POST ${ROUTE.CREATE}`, () => {
    describeValidationErrorTests(
      {
        route: ROUTE.CREATE,
        validBody: MOCK_REGISTER_EXIST_USER,
        requestFn: createRequest.post
      },
      expectResponse
    );

    describe("Success Cases", () => {
      test("should create user successfully", async() => {
        setCaptcha(MOCK_REGISTER_NOTEXIST_USER.captchaId, MOCK_REGISTER_NOTEXIST_USER.captchaText);
        mockUserFindOne(null);

        const response = await createRequest.post(
          ROUTE.CREATE,
          MOCK_REGISTER_NOTEXIST_USER,
          HTTP_STATUS.CREATED
        );

        expectResponse.created(response);
      });
    });

    describe("Validation Captcha Error Cases", () => {
      test("should bad request for invalid captcha", async() => {
        setCaptcha(MOCK_REGISTER_NOTEXIST_USER.captchaId, "captcha");

        const response = await createRequest.post(
          ROUTE.CREATE,
          MOCK_REGISTER_NOTEXIST_USER,
          HTTP_STATUS.BAD_REQUEST
        );

        expectResponse.badRequest(response, "Captcha is incorrect.");
      });
    });

    describeServerErrorTests(
      {
        route: ROUTE.CREATE,
        requestFn: createRequest.post,
        requestBody: MOCK_REGISTER_EXIST_USER,
        dbErrorCases: [
          {
            name: "User.findOne",
            mockFn: User.findOne as jest.Mock,
            setupMocks: (): void => {
              setCaptcha(MOCK_REGISTER_NOTEXIST_USER.captchaId, MOCK_REGISTER_NOTEXIST_USER.captchaText);
              mockUserFindOne();
            }
          },
          {
            name: "User.create",
            mockFn: User.create as jest.Mock,
            setupMocks: (): void => {
              mockUserFindOne(null);
            }
          }
        ]
      },
      expectResponse
    );
  });
});