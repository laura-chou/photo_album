import request from "supertest";

import { HTTP_STATUS } from "../../src/common/constants";

import { expectResponse, mockUserFindById, mockUserFindOne } from "./testUtils";

type TokenInfo = {
  showToken: boolean;
  existUser?: boolean;
  isInvalid?: boolean;
  isExpired?: boolean;
};

type AuthTestCase = [
  description: string, 
  tokenInfo: Partial<TokenInfo>, 
  expectedMessage: "TOKEN_INVALID" | "WRONG_PASSWORD",
  isUserNull: boolean];

type ValidationTestCase = [
  description: string,
  requestBody: Record<string, unknown>,
  isSetJson: boolean,
  expectedMessage: "CONTENT_TYPE" | "JSON_KEY" | "JSON_FORMAT"
];

interface ValidationConfig<T extends Record<string, unknown>> {
  route: string;
  validBody: T;
  requestFn: (
    route: string,
    body: Partial<T> | Record<string, unknown>,
    status: number,
    tokenInfo?: Partial<TokenInfo>,
    isSetJson?: boolean
  ) => Promise<request.Response>;
}

type GetRequestFunction = (
  route: string,
  status: number,
  tokenInfo?: Partial<TokenInfo>
) => Promise<request.Response>;

type ModifyRequestFunction = (
  route: string,
  body: string | object,
  status: number,
  tokenInfo?: Partial<TokenInfo>
) => Promise<request.Response>;

interface ServerErrorConfig {
  route: string;
  requestFn: GetRequestFunction | ModifyRequestFunction;
  requestBody?: object;
  dbErrorCases: {
    name: string;
    mockFn: jest.Mock;
    setupMocks?: () => void;
  }[];
}

type ValidationBaseModel = {
  [key: string]: unknown;
};

const generateInvalidTypeBody = <T extends Record<string, unknown>>(validBody: T): { [K in keyof T]: unknown } => {
  return Object.keys(validBody).reduce((acc, key) => {
    const value = validBody[key as keyof T];

    let invalidValue: unknown;

    if (typeof value === "number") {
      invalidValue = "not a number";
    } else if (typeof value === "string") {
      invalidValue = 9999;
    } else if (typeof value === "boolean") {
      invalidValue = "true";
    } else if (Array.isArray(value)) {
      invalidValue = "not an array";
    } else if (typeof value === "object" && value !== null) {
      invalidValue = "not an object";
    } else {
      invalidValue = null;
    }

    return { ...acc, [key]: invalidValue };
  }, {} as { [K in keyof T]: unknown });
};

export const describeValidationParamsIdTest = (
  route: string,
  requestFn: (
    route: string,
    status: number,
    tokenInfo?: Partial<TokenInfo>
  ) => Promise<request.Response>,
  expectResponseFn: typeof expectResponse,
  title = "Validation Id Parameter"
): void => {
  describe(title, () => {
    test("should return 400 if Id format is invalid", async() => {
      mockUserFindOne();
      
      const response = await requestFn(
        route,
        HTTP_STATUS.BAD_REQUEST,
        {}
      );
      expectResponseFn.badRequest(response, "INVALID_ID");
    });
  });
};

export const describeAuthErrorTests = (
  route: string,
  requestFn: (
    route: string,
    status: number,
    tokenInfo?: Partial<TokenInfo>
  ) => Promise<request.Response>,
  expectResponseFn: typeof expectResponse
): void => {
  const authTestCases: AuthTestCase[] = [
    ["no JWT", { showToken: false }, "TOKEN_INVALID", false],
    ["invalid JWT", { isInvalid: true }, "TOKEN_INVALID", false],
    ["expired JWT", { isExpired: true }, "TOKEN_INVALID", false],
    ["User in JWT does not exist", { existUser: false, showToken: true }, "WRONG_PASSWORD", true]
  ];

  describe("Authentication Error Cases", () => {
    test.each(authTestCases)(
      "should fail if %s",
      async(_, tokenInfo, expectedMessage, isUserNull) => {
        if (isUserNull) {
          mockUserFindById(null);
        } else {
          mockUserFindById();
        }
        const response = await requestFn(route, HTTP_STATUS.UNAUTHORIZED, tokenInfo);
        expectResponseFn.unauthorized(response, expectedMessage);
      }
    );
  });
};

export const describeValidationErrorTests = <T extends ValidationBaseModel>(
  config: ValidationConfig<T> & { includeInvalidLogicTest?: boolean },
  expectResponseFn: typeof expectResponse
): void => {
  describe("Validation Error Cases", () => {
    const validationTestCases: ValidationTestCase[] = [
      ["invalid Content-Type", config.validBody, false, "CONTENT_TYPE"],
      ["missing key in JSON body", { wrongKey: "value" }, true, "JSON_KEY"],
      ["invalid data type", generateInvalidTypeBody(config.validBody), true, "JSON_FORMAT"]
    ];

    test.each(validationTestCases)(
      "should bad request for %s",
      async(_, requestBody, isSetJson, expectedMessage) => {
        mockUserFindOne();

        const response = await config.requestFn(
          config.route,
          requestBody,
          HTTP_STATUS.BAD_REQUEST,
          {},
          isSetJson
        );
        expectResponseFn.badRequest(response, expectedMessage);
      }
    );
  });
};

export const describeServerErrorTests = (
  config: ServerErrorConfig,
  expectResponseFn: typeof expectResponse,
  title = "Server Error Cases"
): void => {
  describe(title, () => {
    test.each(config.dbErrorCases)(
      "should return 500 if $name throws error",
      async({ mockFn, setupMocks }) => {
        if (setupMocks) {
          setupMocks();
        }

        mockFn.mockRejectedValueOnce(new Error("DB Error"));

        const isModifyRequest = config.requestBody !== undefined;

        const response = await (isModifyRequest
          ? (config.requestFn as ModifyRequestFunction)(
              config.route,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              config.requestBody!,
              HTTP_STATUS.SERVER_ERROR
            )
          : (config.requestFn as GetRequestFunction)(
              config.route,
              HTTP_STATUS.SERVER_ERROR
            ));

        expectResponseFn.error(response);
      }
    );
  });
};