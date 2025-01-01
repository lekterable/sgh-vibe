import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
} from "recharts";
import { PricePoint } from "@/data/types";

interface Props {
  prices: PricePoint[];
}

const ranges = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

export default function PriceChart({ prices }: Props) {
  const [range, setRange] = useState<number>(90);

  const data = useMemo(() => {
    const sliced = prices.slice(-range);
    return sliced.map((p) => ({
      ...p,
      dateLabel: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
  }, [prices, range]);
  const hasVolume = data.some((point) => point.volume > 0);

  const [min, max] = useMemo(() => {
    const closes = data.map((d) => d.close);
    const lo = Math.min(...data.map((d) => d.low));
    const hi = Math.max(...data.map((d) => d.high));
    const pad = (hi - lo) * 0.05;
    return [lo - pad, hi + pad];
  }, [data]);

  return (
    <div>
      {/* Range selector */}
      <div className="flex gap-1 mb-4">
        {ranges.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r.days)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              range === r.days
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Price chart */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210 100% 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(210 100% 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" strokeOpacity={0.5} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222 25% 11%)",
                border: "1px solid hsl(222 20% 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "hsl(210 20% 92%)" }}
              itemStyle={{ color: "hsl(210 100% 55%)" }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="hsl(210 100% 55%)"
              strokeWidth={2}
              fill="url(#priceGrad)"
              name="Close"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {hasVolume ? (
        <div className="h-[100px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="dateLabel" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 25% 11%)",
                  border: "1px solid hsl(222 20% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                formatter={(v: number) => [v.toLocaleString(), "Volume"]}
              />
              <Bar dataKey="volume" fill="hsl(210 100% 55%)" opacity={0.4} name="Volume" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-muted-foreground">
          Volume data is not available for this instrument from the current feed.
        </p>
      )}
    </div>
  );
}
