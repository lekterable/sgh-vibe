import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ForecastPoint, PricePoint } from "@/data/types";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  prices: PricePoint[];
  forecast: ForecastPoint[] | undefined;
  isLoading: boolean;
}

export default function ForecastChart({ prices, forecast, isLoading }: Props) {
  const data = useMemo(() => {
    if (!forecast) return [];

    // Last 30 days of actual prices + forecast
    const recent = prices.slice(-30).map((p) => ({
      date: p.date,
      dateLabel: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: p.close,
      forecast: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));

    const projected = forecast.map((f) => ({
      date: f.date,
      dateLabel: new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: null as number | null,
      forecast: f.forecast,
      upper: f.upperBound,
      lower: f.lowerBound,
    }));

    // Connect actual to forecast
    if (recent.length > 0 && projected.length > 0) {
      projected[0].actual = recent[recent.length - 1].actual;
    }

    return [...recent, ...projected];
  }, [prices, forecast]);

  if (isLoading) {
    return <Skeleton className="h-[250px] w-full rounded-lg" />;
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        Select an instrument to view forecast
      </div>
    );
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(45 100% 60%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(45 100% 60%)" stopOpacity={0.02} />
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
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#forecastBand)"
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="transparent"
            name="Lower Bound"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(210 100% 55%)"
            strokeWidth={2}
            dot={false}
            name="Actual"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="hsl(45 100% 60%)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Forecast"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
