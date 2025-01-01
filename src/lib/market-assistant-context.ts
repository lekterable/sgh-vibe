import type { ForecastPoint, MarketData } from "@/data/types";

interface BuildMarketAssistantContextOptions {
  forecast?: ForecastPoint[];
  insight?: string;
  marketData?: MarketData;
  symbol: string;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function buildMarketAssistantContext({
  forecast,
  insight,
  marketData,
  symbol,
}: BuildMarketAssistantContextOptions) {
  const lines = [
    `Instrument: ${marketData?.instrument.name ?? symbol} (${symbol})`,
    "This dashboard uses educational chart data and model-generated insights, not live brokerage data.",
  ];

  if (marketData) {
    const latest = marketData.prices[marketData.prices.length - 1];
    const trailingWeek = marketData.prices.slice(-5).map((point) => point.close);
    const weeklyHigh = Math.max(...trailingWeek);
    const weeklyLow = Math.min(...trailingWeek);

    lines.push(
      `Latest close: $${formatPrice(marketData.latestPrice)}`,
      `Day change: ${formatPercent(marketData.changePercent)} (${marketData.change >= 0 ? "+" : ""}$${formatPrice(marketData.change)})`,
      `Recent 5-session range: $${formatPrice(weeklyLow)} to $${formatPrice(weeklyHigh)}`,
      `Latest volume: ${formatVolume(latest.volume)}`,
    );
  }

  if (forecast?.length) {
    const start = forecast[0];
    const end = forecast[forecast.length - 1];
    const forecastChange = ((end.forecast - start.forecast) / start.forecast) * 100;

    lines.push(
      `30-day forecast starts at $${formatPrice(start.forecast)} and ends at $${formatPrice(end.forecast)} (${formatPercent(forecastChange)}).`,
      `Final forecast band: $${formatPrice(end.lowerBound)} to $${formatPrice(end.upperBound)}.`,
    );
  }

  if (insight) {
    lines.push(`Current insight summary:\n${insight}`);
  }

  return lines.join("\n");
}
