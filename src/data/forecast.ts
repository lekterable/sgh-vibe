import { ForecastPoint, PricePoint } from "./types";

/**
 * Simple moving average forecast with expanding confidence bands.
 * Uses a weighted blend of short-term (10-day) and long-term (50-day) MAs
 * to project forward, with volatility-based confidence intervals.
 */
export function computeForecast(prices: PricePoint[], forecastDays: number = 30): ForecastPoint[] {
  if (prices.length < 50) return [];

  const closes = prices.map((p) => p.close);
  const n = closes.length;

  // Calculate MAs
  const sma10 = closes.slice(n - 10).reduce((a, b) => a + b, 0) / 10;
  const sma50 = closes.slice(n - 50).reduce((a, b) => a + b, 0) / 50;

  // Historical volatility (annualized std of daily returns)
  const returns = [];
  for (let i = 1; i < n; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, r) => a + (r - meanReturn) ** 2, 0) / returns.length;
  const dailyVol = Math.sqrt(variance);

  // Trend direction from MA crossover
  const trendBias = sma10 > sma50 ? 1 : -1;
  const momentumStrength = Math.abs(sma10 - sma50) / sma50;
  const dailyDrift = trendBias * Math.min(momentumStrength * 0.02, dailyVol * 0.3);

  const lastPrice = closes[n - 1];
  const lastDate = new Date(prices[n - 1].date);
  const forecast: ForecastPoint[] = [];

  let projectedPrice = lastPrice;

  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);

    projectedPrice = projectedPrice * (1 + dailyDrift);
    const confidence = dailyVol * Math.sqrt(i) * projectedPrice;

    forecast.push({
      date: date.toISOString().split("T")[0],
      forecast: +projectedPrice.toFixed(2),
      upperBound: +(projectedPrice + confidence * 1.96).toFixed(2),
      lowerBound: +Math.max(0, projectedPrice - confidence * 1.96).toFixed(2),
    });
  }

  return forecast;
}

/**
 * Generate a plain-English market insight based on price data.
 */
export function generateInsight(prices: PricePoint[], symbol: string): string {
  if (prices.length < 50) return "Insufficient data for analysis.";

  const closes = prices.map((p) => p.close);
  const n = closes.length;
  const latest = closes[n - 1];
  const prev = closes[n - 2];

  // Trend
  const sma20 = closes.slice(n - 20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = closes.slice(n - 50).reduce((a, b) => a + b, 0) / 50;
  const trendDirection = sma20 > sma50 ? "bullish" : "bearish";
  const change30d = ((latest - closes[n - 30]) / closes[n - 30]) * 100;

  // Volatility
  const returns = [];
  for (let i = n - 20; i < n; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  const vol = Math.sqrt(returns.reduce((a, r) => a + r * r, 0) / returns.length) * Math.sqrt(252) * 100;
  const volLabel = vol > 40 ? "high" : vol > 20 ? "moderate" : "low";

  // Risk
  const maxDrawdown = (() => {
    let peak = closes[0];
    let maxDd = 0;
    for (const c of closes.slice(-60)) {
      peak = Math.max(peak, c);
      maxDd = Math.max(maxDd, (peak - c) / peak);
    }
    return maxDd * 100;
  })();
  const riskLabel = maxDrawdown > 15 ? "elevated" : maxDrawdown > 8 ? "moderate" : "low";

  return `📊 **${symbol} Market Analysis**\n\n` +
    `**Trend:** The instrument is showing a ${trendDirection} trend. ` +
    `The 20-day moving average is ${sma20 > sma50 ? "above" : "below"} the 50-day MA, ` +
    `suggesting ${trendDirection} momentum. Price has moved ${change30d > 0 ? "+" : ""}${change30d.toFixed(1)}% over the last 30 trading days.\n\n` +
    `**Volatility:** Annualized volatility stands at ${vol.toFixed(1)}%, which is considered ${volLabel} ` +
    `for this asset class. ${vol > 30 ? "Traders should be prepared for significant price swings." : "Price action has been relatively stable."}\n\n` +
    `**Risk Assessment:** Downside risk is ${riskLabel}, with a maximum drawdown of ${maxDrawdown.toFixed(1)}% ` +
    `observed over the past 60 trading sessions. ` +
    `${riskLabel === "elevated" ? "Consider position sizing carefully." : "Current risk levels are manageable for most portfolios."}\n\n` +
    `*⚠️ This is an educational analysis using simplified models. Not financial advice.*`;
}
