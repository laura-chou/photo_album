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

interface UserAuthInfo {
  userName: string;
  password: string;
  token: string;
}

export const MOCK_USER_INFO: UserAuthInfo = { 
  userName: "testuser",
  password: "$2b$12$Vq/jVzpDcq0h/oDw6.9a5OTDbMI5oLygA0HUxNStwP3We550BoFci",
  token: "token"
};

export const MOCK_EXIST_USER: LoginRequest = {
  account: MOCK_USER_INFO.userName,
  password: "userpassword"
};

export const MOCK_NOTEXIST_USER: LoginRequest = { 
  account: "not exist user",
  password: "not exist"
};

