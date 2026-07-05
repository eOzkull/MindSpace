import { apiClient } from './client';

export const fetchRecommendations = async (): Promise<unknown> => {
  return apiClient.get<unknown>('/recommendations');
};
