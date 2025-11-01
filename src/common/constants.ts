export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
} as const;

export const CONTENT_TYPE = {
  JSON: "application/json",
  JSON_WITH_CHARSET: /application\/json/,
  TEXT: "text/html",
  TEXT_WITH_CHARSET: /text\/html/,
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  FORM_DATA: "multipart/form-data"
} as const;

export const RESPONSE_MESSAGE = {
  SUCCESS: "",
  NOT_FOUND: "No data found.",
  SERVER_ERROR: "Internal server error.",
  WRONG_PASSWORD: "Wrong password.",
  INVALID_CONTENT_TYPE: "Invalid content type.",
  INVALID_JSON_KEY: "Invalid JSON key.",
  INVALID_JSON_FORMAT: "Invalid JSON format.",
  ENV_ERROR: "Environment variable is not setting.",
  FORBIDDEN_CORS: "Forbidden: CORS policy does not allow access from this origin.",
  USER_NOT_EXIST: "User does not exist.",
  TOKEN_EXPIRED: "Token expired.",
  INVALID_ID: "Invalid ID format.",
  DATA_ALREADY_EXISTS: "This record already exists.",
  TOO_MANY_REQUESTS: "Too many requests. Please wait a moment.",
  INVALID_CAPTCHA: "Captcha is incorrect.",
  UPLOAD_LIMIT: "File upload limit exceeded (max 3 files).",
  NO_FILE: "No file upload.",
  LIMIT_FILE_SIZE: "File size exceeds the limit. Please upload a file smaller than 1MB.",
  LIMIT_FORMAT: "Invalid file format. Only image files are allowed."
} as const;