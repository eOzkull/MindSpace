import { useQuery } from '@tanstack/react-query';
import { fetchEvaluate, fetchResults } from '../api/prediction';
import type { EvaluateResponse } from '../types/evaluate';
import type { ResultsResponse } from '../types/prediction';

export const useEvaluate = (dataset: string = 'primary') => {
  return useQuery<EvaluateResponse, Error>({
    queryKey: ['evaluate', dataset],
    queryFn: () => fetchEvaluate(dataset),
  });
};

export const useResults = () => {
  return useQuery<ResultsResponse, Error>({
    queryKey: ['results'],
    queryFn: fetchResults,
  });
};
