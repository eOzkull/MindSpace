import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../api/upload';
import type { HistoryResponse } from '../types/common';

export const useHistory = () => {
  return useQuery<HistoryResponse, Error>({
    queryKey: ['history'],
    queryFn: fetchHistory,
  });
};
