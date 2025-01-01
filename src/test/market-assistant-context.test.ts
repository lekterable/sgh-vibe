import { describe, expect, it } from "vitest";

import type { ForecastPoint, MarketData } from "@/data/types";
import { buildMarketAssistantContext } from "@/lib/market-assistant-context";

const marketData: MarketData = {
  instrument: {
    name: "Apple Inc.",
    symbol: "AAPL",
    type: "stock",
  },
  prices: [
    { close: 180, date: "2026-04-01", high: 182, low: 176, open: 178, volume: 1200000 },
    { close: 181.2, date: "2026-04-02", high: 183, low: 179, open: 180, volume: 1320000 },
    { close: 183.5, date: "2026-04-03", high: 184, low: 180.2, open: 181.5, volume: 1490000 },
    { close: 182.8, date: "2026-04-04", high: 185, low: 181, open: 183.6, volume: 1280000 },
    { close: 184.9, date: "2026-04-05", high: 186, low: 182.5, open: 183.1, volume: 1580000 },
  ],
  latestPrice: 184.9,
  change: 2.1,
  changePercent: 1.15,
};

const forecast: ForecastPoint[] = [
  { date: "2026-04-06", forecast: 185, lowerBound: 179, upperBound: 191 },
  { date: "2026-05-06", forecast: 191.4, lowerBound: 182.2, upperBound: 198.6 },
];

describe("buildMarketAssistantContext", () => {
  it("includes the current instrument, price snapshot, and forecast summary", () => {
    const result = buildMarketAssistantContext({
      forecast,
      insight: "**Trend:** constructive\n*Volatility:* moderate",
      marketData,
      symbol: "AAPL",
    });

    expect(result).toContain("Apple Inc. (AAPL)");
    expect(result).toContain("Latest close: $184.90");
    expect(result).toContain("30-day forecast starts at $185.00 and ends at $191.40 (+3.46%).");
    expect(result).toContain("Current insight summary:");
  });
});
