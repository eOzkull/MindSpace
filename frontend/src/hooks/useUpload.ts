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
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};

export const useResetSession = () => {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, Error, void>({
    mutationFn: resetSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};


