import { apiClient } from './client';

export const fetchAnomalies = async (): Promise<unknown> => {
  return apiClient.get<unknown>('/anomalies');
};
