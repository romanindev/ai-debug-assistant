function getStringEnv(key: string, fallback: string): string {
  const value = import.meta.env[key]

  return typeof value === 'string' && value.trim().length > 0
    ? value
    : fallback
}

function getNumberEnv(key: string, fallback: number): number {
  const value = Number(import.meta.env[key])

  return Number.isFinite(value) && value > 0 ? value : fallback
}

export const appConfig = {
  api: {
    url: getStringEnv('VITE_API_URL', 'http://localhost:3000'),
    timeoutMs: getNumberEnv('VITE_API_TIMEOUT_MS', 10_000),
  },
} as const
