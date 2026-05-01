export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
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
