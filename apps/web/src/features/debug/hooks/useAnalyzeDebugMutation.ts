import { useMutation } from '@tanstack/react-query';

import { analyzeDebug } from '../api/analyzeDebug';

export function useAnalyzeDebugMutation() {
  return useMutation({
    mutationFn: analyzeDebug,
  });
}
