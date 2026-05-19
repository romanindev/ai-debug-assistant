export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  logging: {
    logError: parseBooleanFlag(process.env.LOG_ERROR),
  },
  persistence: {
    persistAnalyses: parseBooleanFlag(process.env.PERSIST_ANALYSES),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
    cookieName: process.env.AUTH_COOKIE_NAME ?? 'ai_debug_session',
    cookieSecure: parseBooleanFlag(process.env.AUTH_COOKIE_SECURE),
    cookieMaxAgeMs: parseInt(
      process.env.AUTH_COOKIE_MAX_AGE_MS ?? '604800000',
      10,
    ),
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'mock',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
      requestTimeoutMs: parseInt(
        process.env.AI_REQUEST_TIMEOUT_MS ?? '15000',
        10,
      ),
    },
  },
});

function parseBooleanFlag(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}
