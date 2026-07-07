import { apiClient } from './client';
import type { EvaluateResponse } from '../types/evaluate';
import type { ResultsResponse } from '../types/prediction';

export const fetchEvaluate = async (dataset: string = 'primary'): Promise<EvaluateResponse> => {
  return apiClient.get<EvaluateResponse>(`/evaluate?dataset=${dataset}`);
};

export const fetchResults = async (): Promise<ResultsResponse> => {
  return apiClient.get<ResultsResponse>('/results');
};
