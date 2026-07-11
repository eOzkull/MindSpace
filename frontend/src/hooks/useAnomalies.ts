import { useQuery } from '@tanstack/react-query';
import { fetchAnomalies } from '../api/anomalies';

export const useAnomalies = () => {
  return useQuery<unknown, Error>({
    queryKey: ['anomalies'],
    queryFn: fetchAnomalies,
  });
};
