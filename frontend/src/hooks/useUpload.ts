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
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['evaluate'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
=======
      // Invalidate and reset ALL queries across the app on dataset upload so all pages fetch fresh dataset results
      queryClient.invalidateQueries();
<<<<<<< HEAD
      queryClient.resetQueries();
>>>>>>> 675db75 (fix anomaly bug, recommendations bug, reload errors, framer-motion react19 router error, client.ts errors, minor ui changes)
=======
>>>>>>> e2ce248 (Ml accuracy improvements (#62))
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
