import { apiClient } from './client';
import type { CompareStatusResponse, UploadResponse, CompareResultsResponse, SuccessResponse } from '../types/common';

export const fetchCompareStatus = async (): Promise<CompareStatusResponse> => {
  return apiClient.get<CompareStatusResponse>('/compare');
};

export const uploadCompareFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<UploadResponse>('/compare/upload', formData);
};

export const fetchCompareResults = async (): Promise<CompareResultsResponse> => {
  return apiClient.get<CompareResultsResponse>('/compare/results');
};

export const clearCompare = async (): Promise<SuccessResponse> => {
  return apiClient.post<SuccessResponse>('/compare/clear');
};
