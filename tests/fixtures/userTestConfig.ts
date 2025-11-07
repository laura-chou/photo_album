const base = "/user";

export const ROUTE = {
  LOGIN: `${base}/login`,
  CREATE: `${base}/create`,
  CAPTCHA: `${base}/captcha`
} as const;

type LoginRequest = {
  account: string;
  password: string;
}

type RegisterRequest = {
  account: string;
  password: string;
  captchaId: string;
  captchaText: string;
}

interface CaptchaInfo {
  captchaId: string;
  svg: string;
}


interface UserAuthInfo {
  _id: string;
  userName: string;
  password: string;
  token: string;
}

export const MOCK_CAPTCHA: CaptchaInfo = {
  captchaId: "test-id",
  svg: "<svg>captcha</svg>"
};

export const MOCK_USER_INFO: UserAuthInfo = { 
  _id: "abc123",
  userName: "testuser",
  password: "$2b$12$Vq/jVzpDcq0h/oDw6.9a5OTDbMI5oLygA0HUxNStwP3We550BoFci",
  token: "token"
};

export const MOCK_LOGIN_EXIST_USER: LoginRequest = {
  account: MOCK_USER_INFO.userName,
  password: "userpassword"
};

export const MOCK_LOGIN_NOTEXIST_USER: LoginRequest = { 
  account: "not exist user",
  password: "not exist"
};

export const MOCK_REGISTER_EXIST_USER: RegisterRequest = {
  account: "newuser",
  password: "newpassword",
  captchaId: "captcha123",
  captchaText: "abcd"
};

export const MOCK_REGISTER_NOTEXIST_USER: RegisterRequest = {
  account:  MOCK_USER_INFO.userName,
  password: "password",
  captchaId: "captcha123",
  captchaText: "abcd"
};

