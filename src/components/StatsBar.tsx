import { PricePoint } from "@/data/types";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { useMemo } from "react";

interface Props {
  prices: PricePoint[];
}

export default function StatsBar({ prices }: Props) {
  const stats = useMemo(() => {
    if (prices.length < 2) return null;
    const closes = prices.map((p) => p.close);
    const n = closes.length;
    const latest = closes[n - 1];

    const high52 = Math.max(...closes);
    const low52 = Math.min(...closes);

    const returns = [];
    for (let i = 1; i < n; i++) returns.push(Math.log(closes[i] / closes[i - 1]));
    const vol = Math.sqrt(returns.reduce((a, r) => a + r * r, 0) / returns.length) * Math.sqrt(252) * 100;

    const avgVol = Math.round(prices.slice(-20).reduce((a, p) => a + p.volume, 0) / 20);

    return { high52, low52, vol, avgVol, latest, hasVolume: prices.some((p) => p.volume > 0) };
  }, [prices]);

  if (!stats) return null;

  const items = [
    { label: "52W High", value: `$${stats.high52.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <TrendingUp className="h-3.5 w-3.5 text-gain" /> },
    { label: "52W Low", value: `$${stats.low52.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <TrendingDown className="h-3.5 w-3.5 text-loss" /> },
    { label: "Volatility", value: `${stats.vol.toFixed(1)}%`, icon: <Activity className="h-3.5 w-3.5 text-chart-accent" /> },
    { label: "Avg Volume", value: stats.hasVolume ? `${(stats.avgVol / 1_000_000).toFixed(1)}M` : "N/A", icon: <BarChart3 className="h-3.5 w-3.5 text-chart-volume" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            {item.icon}
            {item.label}
          </div>
          <div className="font-mono font-semibold text-sm">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
