import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCompareStatus, uploadCompareFile, fetchCompareResults, clearCompare } from '../api/compare';
import type { CompareStatusResponse, UploadResponse, CompareResultsResponse, SuccessResponse } from '../types/common';

export const useCompareStatus = () => {
  return useQuery<CompareStatusResponse, Error>({
    queryKey: ['compareStatus'],
    queryFn: fetchCompareStatus,
  });
};

export const useUploadCompareFile = () => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, File>({
    mutationFn: uploadCompareFile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['compareStatus'] });
      await queryClient.invalidateQueries({ queryKey: ['compareResults'] });
    },
  });
};

export const useCompareResults = () => {
  return useQuery<CompareResultsResponse, Error>({
    queryKey: ['compareResults'],
    queryFn: fetchCompareResults,
    enabled: false,
  });
};

export const useClearCompare = () => {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, Error, void>({
    mutationFn: clearCompare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compareStatus'] });
      queryClient.invalidateQueries({ queryKey: ['compareResults'] });
    },
  });
};
