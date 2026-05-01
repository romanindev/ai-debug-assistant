import { useQuery } from "@tanstack/react-query";

import { getApiHealth } from "../../api/health";

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getApiHealth,
  })
}
