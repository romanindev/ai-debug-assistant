import { httpClient } from './httpClient';

export type HealthResponse = {
    status: string;
    service: string;
};

export async function getApiHealth(): Promise<HealthResponse> {
    const response = await httpClient.get<HealthResponse>('/health');

    return response.data;
}