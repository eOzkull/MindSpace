import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '../api/recommendations';

export const useInsights = () => {
  return useQuery<unknown, Error>({
    queryKey: ['insights'],
    queryFn: fetchRecommendations,
  });
};
