import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHistory, uploadFile, resetSession } from '../api/upload';
import type { HistoryResponse, UploadResponse, SuccessResponse } from '../types/common';

export const useHistory = () => {
  return useQuery<HistoryResponse, Error>({
    queryKey: ['history'],
    queryFn: fetchHistory,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, File>({
    mutationFn: uploadFile,
    onSuccess: () => {
      // Invalidate and reset ALL queries across the app on dataset upload so all pages fetch fresh dataset results
      queryClient.invalidateQueries();
      queryClient.resetQueries();
    },
  });
};

export const useResetSession = () => {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, Error, void>({
    mutationFn: resetSession,
    onSuccess: () => {
      // Clear all cached query data when session is reset
      queryClient.invalidateQueries();
      queryClient.resetQueries();
    },
  });
};
