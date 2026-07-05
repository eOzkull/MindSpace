import { apiClient } from './client';
import type { DashboardResponse } from '../types/dashboard';
import type { UpdatePayload, SuccessResponse } from '../types/common';

export const fetchDashboard = async (): Promise<DashboardResponse> => {
  return apiClient.get<DashboardResponse>('/dashboard');
};

export const updateData = async (updates: UpdatePayload[]): Promise<SuccessResponse> => {
  return apiClient.post<SuccessResponse>('/edit', { updates });
};
