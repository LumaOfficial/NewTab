/**
 * Runtime configuration. Everything the service needs comes from the
 * environment; nothing secret is committed.
 */
const list = (value) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 8000),
  dataDir: process.env.LUMA_DATA_DIR ?? './.data',
  /** Codes are only echoed back when no email provider is connected (dev/preview). */
  exposeDevCodes: process.env.LUMA_EXPOSE_DEV_CODES === '1',
  /** Where the browser app lives, used for OAuth redirects after a callback. */
  appUrls: list(process.env.LUMA_APP_URLS),
  /** Extra origins allowed to call the API (the extension build talks to it directly). */
  allowedOrigins: list(process.env.LUMA_ALLOWED_ORIGINS),
  /** Key used to encrypt integration tokens at rest. */
  tokenKey: process.env.LUMA_TOKEN_KEY ?? '',
  sessionDays: 30,
  verificationMinutes: 15,
  resetMinutes: 30,
};
