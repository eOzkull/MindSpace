import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDashboard, updateData } from '../api/dashboard';
import type { DashboardResponse } from '../types/dashboard';
import type { UpdatePayload, SuccessResponse } from '../types/common';

export const useDashboard = () => {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });
};

export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, Error, UpdatePayload[]>({
    mutationFn: updateData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
