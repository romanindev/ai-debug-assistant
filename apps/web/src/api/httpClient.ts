import axios from 'axios'

import { appConfig } from '../config/appConfig'

export const httpClient = axios.create({
    baseURL: appConfig.api.url,
    timeout: appConfig.api.timeoutMs,
    headers: {
        'Content-Type': 'application/json',
    },
})
