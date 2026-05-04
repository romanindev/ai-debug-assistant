export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  logging: {
    logError: parseBooleanFlag(process.env.LOG_ERROR),
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
