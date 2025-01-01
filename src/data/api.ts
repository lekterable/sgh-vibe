import { Instrument, MarketData, ForecastPoint } from "./types";
import { instruments } from "./instruments";
import { computeForecast, generateInsight } from "./forecast";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";
const HISTORY_DAYS = 365;

const providerSymbolMap: Record<string, string> = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
};

interface TwelveDataTimeSeriesValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

interface TwelveDataTimeSeriesResponse {
  status?: "ok" | "error";
  message?: string;
  code?: number;
  values?: TwelveDataTimeSeriesValue[];
}

function getApiKey() {
  const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing Twelve Data API key. Set VITE_TWELVE_DATA_API_KEY in your Vite environment.");
  }

  return apiKey;
}

function getProviderSymbol(symbol: string) {
  return providerSymbolMap[symbol] ?? symbol;
}

async function fetchTwelveData<T>(path: string, params: Record<string, string>) {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    ...params,
    apikey: apiKey,
  });

  const response = await fetch(`${TWELVE_DATA_BASE_URL}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Twelve Data request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as T & {
    status?: "ok" | "error";
    message?: string;
    code?: number;
  };

  if (data.status === "error") {
    throw new Error(data.message || "Twelve Data returned an error.");
  }

  return data;
}

export async function fetchInstruments(): Promise<Instrument[]> {
  return instruments;
}

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  const instrument = instruments.find((i) => i.symbol === symbol);
  if (!instrument) throw new Error(`Unknown symbol: ${symbol}`);

  const providerSymbol = getProviderSymbol(symbol);
  const response = await fetchTwelveData<TwelveDataTimeSeriesResponse>("/time_series", {
    symbol: providerSymbol,
    interval: "1day",
    outputsize: String(HISTORY_DAYS),
  });

  const prices = (response.values ?? [])
    .slice()
    .reverse()
    .map((point) => ({
      date: point.datetime.slice(0, 10),
      open: Number(point.open),
      high: Number(point.high),
      low: Number(point.low),
      close: Number(point.close),
      volume: Number(point.volume ?? 0),
    }));

  if (prices.length < 2) {
    throw new Error(`Not enough historical data returned for ${symbol}.`);
  }

  const latest = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const change = latest.close - prev.close;
  const changePercent = (change / prev.close) * 100;

  return { instrument, prices, latestPrice: latest.close, change, changePercent };
}

export async function fetchForecast(symbol: string): Promise<ForecastPoint[]> {
  const { prices } = await fetchMarketData(symbol);
  return computeForecast(prices, 30);
}

export async function fetchInsight(symbol: string): Promise<string> {
  const { prices } = await fetchMarketData(symbol);
  return generateInsight(prices, symbol);
}
