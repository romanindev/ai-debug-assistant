import axios from 'axios'

const DEFAULT_API_TIMEOUT_MS = 10_000

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    timeout: getApiTimeoutMs(),
    headers: {
        'Content-Type': 'application/json',
    },
})

function getApiTimeoutMs(): number {
    const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS)

    return Number.isFinite(timeoutMs) && timeoutMs > 0
        ? timeoutMs
        : DEFAULT_API_TIMEOUT_MS
}
