import { MarketData } from "@/data/types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  data: MarketData;
}

export default function PriceHeader({ data }: Props) {
  const isPositive = data.change >= 0;

  return (
    <div className="flex items-baseline gap-4">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight">
          {data.instrument.symbol}
        </h1>
        <p className="text-sm text-muted-foreground">{data.instrument.name}</p>
      </div>
      <div className="flex items-baseline gap-3 ml-auto">
        <span className="text-3xl font-mono font-bold">
          {data.instrument.type === "crypto" ? "" : "$"}
          {data.latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span
          className={`flex items-center gap-1 text-sm font-mono font-semibold ${
            isPositive ? "text-gain" : "text-loss"
          }`}
        >
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {isPositive ? "+" : ""}
          {data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
