import svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";

const captchaStore = new Map<string, { text: string; expiresAt: number }>();

export const enum CaptchaVerificationResult {
  VALID = "VALID",
  EXPIRED = "EXPIRED",
  NOT_FOUND = "NOT_FOUND",
  MISMATCH = "MISMATCH",
}

type CaptchaResult = {
  text: string | null;
  status: CaptchaVerificationResult
};

export interface CaptchaData {
  captchaId: string;
  svg: string;
}

export const setCaptcha = (
  id: string,
  text: string,
  ttlMs: number = 180000
): void => {
  const expiresAt = Date.now() + ttlMs;
  captchaStore.set(id, { text, expiresAt });

  setTimeout(() => {
    captchaStore.delete(id);
  }, ttlMs);
};

export const getCaptcha = (
  id: string
): CaptchaResult => {
  const entry = captchaStore.get(id);
  if (!entry) {
    return { text: null, status: CaptchaVerificationResult.NOT_FOUND };
  }
  if (Date.now() > entry.expiresAt) {
    captchaStore.delete(id);
    return { text: null, status: CaptchaVerificationResult.EXPIRED };
  }
  return { text: entry.text, status: CaptchaVerificationResult.VALID };
};

export const verifyCaptcha = (
  captchaId: string,
  captchaText: string
): string => {
  const { status, text } = getCaptcha(captchaId);
  if (status !== "VALID") return status;
  return text?.toLowerCase() === captchaText.toLowerCase() 
  ? CaptchaVerificationResult.VALID
  : CaptchaVerificationResult.MISMATCH;
};

export const createCaptcha = (id?: string): CaptchaData => {
  if (id) captchaStore.delete(id);

  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: "o01il",
    color: true,
    background: "#fff",
    noise: 2,
  });

  const captchaId = uuidv4();
  setCaptcha(captchaId, captcha.text);

  return {
    captchaId,
    svg: captcha.data,
  };
};