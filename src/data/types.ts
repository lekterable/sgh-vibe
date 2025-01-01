export type InstrumentType = "stock" | "etf" | "crypto";

export interface Instrument {
  symbol: string;
  name: string;
  type: InstrumentType;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ForecastPoint {
  date: string;
  forecast: number;
  upperBound: number;
  lowerBound: number;
}

export interface MarketInsight {
  trend: string;
  volatility: string;
  risk: string;
  summary: string;
}

export interface MarketData {
  instrument: Instrument;
  prices: PricePoint[];
  latestPrice: number;
  change: number;
  changePercent: number;
}
