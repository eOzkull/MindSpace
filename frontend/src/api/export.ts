import { apiClient } from './client';

export const exportData = async (): Promise<unknown> => {
  return apiClient.get<unknown>('/export');
};
