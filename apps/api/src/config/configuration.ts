export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});
