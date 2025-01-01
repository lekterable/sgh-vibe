import { PricePoint } from "./types";

// Seed-based pseudo-random for reproducible data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const baseConfigs: Record<string, { basePrice: number; volatility: number; drift: number }> = {
  AAPL: { basePrice: 175, volatility: 0.018, drift: 0.0003 },
  MSFT: { basePrice: 380, volatility: 0.016, drift: 0.0004 },
  GOOGL: { basePrice: 140, volatility: 0.02, drift: 0.0002 },
  AMZN: { basePrice: 178, volatility: 0.022, drift: 0.0003 },
  TSLA: { basePrice: 245, volatility: 0.035, drift: 0.0001 },
  SPY: { basePrice: 475, volatility: 0.01, drift: 0.0003 },
  QQQ: { basePrice: 405, volatility: 0.013, drift: 0.0004 },
  VTI: { basePrice: 240, volatility: 0.009, drift: 0.0003 },
  BTC: { basePrice: 43500, volatility: 0.04, drift: 0.0005 },
  ETH: { basePrice: 2280, volatility: 0.045, drift: 0.0004 },
  SOL: { basePrice: 98, volatility: 0.06, drift: 0.0006 },
};

export function generateMockPrices(symbol: string, days: number = 365): PricePoint[] {
  const config = baseConfigs[symbol] || { basePrice: 100, volatility: 0.02, drift: 0.0002 };
  const rand = seededRandom(hashString(symbol));
  const prices: PricePoint[] = [];

  let price = config.basePrice * (0.85 + rand() * 0.3);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends for stocks/ETFs
    const dayOfWeek = date.getDay();
    if (symbol !== "BTC" && symbol !== "ETH" && symbol !== "SOL" && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }

    const dailyReturn = config.drift + config.volatility * (rand() - 0.5) * 2;
    price = price * (1 + dailyReturn);

    const intraRange = price * config.volatility * (0.5 + rand());
    const open = price * (1 + (rand() - 0.5) * config.volatility * 0.5);
    const high = Math.max(open, price) + intraRange * rand() * 0.5;
    const low = Math.min(open, price) - intraRange * rand() * 0.5;
    const volume = Math.round((5 + rand() * 20) * 1_000_000 * (config.basePrice > 1000 ? 0.1 : 1));

    prices.push({
      date: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +price.toFixed(2),
      volume,
    });
  }

  return prices;
}
