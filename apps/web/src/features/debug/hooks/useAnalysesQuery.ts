import { useQuery } from '@tanstack/react-query';

import { listAnalyses } from '../api/listAnalyses';

export const analysesQueryKey = ['debugAnalyses'] as const;

export function useAnalysesQuery(enabled: boolean) {
  return useQuery({
    queryKey: analysesQueryKey,
    queryFn: listAnalyses,
    enabled,
  });
}
