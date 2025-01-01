import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInstruments, fetchMarketData } from "./api";
import { computeForecast, generateInsight } from "./forecast";

const MARKET_DATA_STALE_TIME = 5 * 60_000;

function getMarketDataQueryOptions(symbol: string) {
  return {
    queryKey: ["marketData", symbol],
    queryFn: () => fetchMarketData(symbol),
    enabled: !!symbol,
    staleTime: MARKET_DATA_STALE_TIME,
  } as const;
}

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: fetchInstruments,
    staleTime: Infinity,
  });
}

export function useMarketData(symbol: string) {
  return useQuery(getMarketDataQueryOptions(symbol));
}

export function useForecast(symbol: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["forecast", symbol],
    queryFn: async () => {
      const marketData = await queryClient.ensureQueryData(getMarketDataQueryOptions(symbol));
      return computeForecast(marketData.prices, 30);
    },
    enabled: !!symbol,
    staleTime: MARKET_DATA_STALE_TIME,
  });
}

export function useInsight(symbol: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["insight", symbol],
    queryFn: async () => {
      const marketData = await queryClient.ensureQueryData(getMarketDataQueryOptions(symbol));
      return generateInsight(marketData.prices, symbol);
    },
    enabled: !!symbol,
    staleTime: MARKET_DATA_STALE_TIME,
  });
}
