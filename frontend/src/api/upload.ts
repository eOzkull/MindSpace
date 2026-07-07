import { apiClient } from './client';
import type { HistoryResponse, SuccessResponse, UploadResponse } from '../types/common';

export const fetchHistory = async (): Promise<HistoryResponse> => {
  return apiClient.get<HistoryResponse>('/history');
};

export const resetSession = async (): Promise<SuccessResponse> => {
  return apiClient.post<SuccessResponse>('/reset');
};

export const deleteSession = async (idx: number): Promise<SuccessResponse> => {
  return apiClient.delete<SuccessResponse>(`/delete-session/${idx}`);
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<UploadResponse>('/upload', formData);
};
