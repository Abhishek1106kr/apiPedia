import { useQuery } from "@tanstack/react-query";
import { fetchApis } from "@/lib/api-client";

export function useApis() {
  return useQuery({
    queryKey: ["apis"],
    queryFn: fetchApis,
  });
}
