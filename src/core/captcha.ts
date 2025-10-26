const captchaStore = new Map<string, { text: string; expiresAt: number }>();

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
}

export const getCaptcha = (
  id: string
): string | null => {
  const entry = captchaStore.get(id);
  if (!entry || Date.now() > entry.expiresAt) {
    captchaStore.delete(id);
    return null;
  }
  return entry.text;
}