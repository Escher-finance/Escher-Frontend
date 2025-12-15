import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { useChain } from "@cosmos-kit/react";
import { RouteRequest, RouteResponse, SkipClient } from "@skip-go/client";
import { useQuery } from "@tanstack/react-query";

export function useSkipClient(): {
  skipClient: SkipClient | undefined;
} {
  const cosmosChain = useChain(CHAINS.babylon.chainName ?? "");

  const { data: skipClient } = useQuery({
    queryKey: ["query", cosmosChain.address],
    queryFn: () => {
      return new SkipClient({
        getCosmosSigner: async (/* chainID: string */) => {
          return cosmosChain.getOfflineSigner();
        },
      });
    },
  });

  return {
    skipClient
  };
}

export function useSkipSimulation({
  skipClient,
  routeRequest,
}: {
  skipClient?: SkipClient;
  routeRequest?: RouteRequest;
}) {
  return useQuery<RouteResponse | undefined>({
    queryKey: ["simulation", routeRequest],
    enabled: !!skipClient && !!routeRequest,
    staleTime: 0,
    retry: 1,
    refetchInterval: APP_CONFIG.skipRouteRefetchInterval,
    queryFn: async () => {
      if (!skipClient || !routeRequest) return undefined;

      return await skipClient.route(routeRequest);
    },
  });
}