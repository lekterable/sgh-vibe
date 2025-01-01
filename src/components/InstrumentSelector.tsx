import { useState } from "react";
import { useInstruments } from "@/data/hooks";
import { InstrumentType } from "@/data/types";
import { TrendingUp, Layers, Bitcoin } from "lucide-react";

const typeIcons: Record<InstrumentType, React.ReactNode> = {
  stock: <TrendingUp className="h-3.5 w-3.5" />,
  etf: <Layers className="h-3.5 w-3.5" />,
  crypto: <Bitcoin className="h-3.5 w-3.5" />,
};

const typeLabels: Record<InstrumentType, string> = {
  stock: "Stocks",
  etf: "ETFs",
  crypto: "Crypto",
};

interface Props {
  selected: string;
  onSelect: (symbol: string) => void;
}

export default function InstrumentSelector({ selected, onSelect }: Props) {
  const { data: instruments } = useInstruments();
  const [filter, setFilter] = useState<InstrumentType | "all">("all");

  const filtered = instruments?.filter(
    (i) => filter === "all" || i.type === filter
  );

  return (
    <div className="space-y-3">
      {/* Type filters */}
      <div className="w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-1.5">
          {(["all", "stock", "etf", "crypto"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t !== "all" && typeIcons[t]}
              {t === "all" ? "All" : typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument list */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {filtered?.map((inst) => (
          <button
            key={inst.symbol}
            onClick={() => onSelect(inst.symbol)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
              selected === inst.symbol
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground">{typeIcons[inst.type]}</span>
              <div className="text-left">
                <span className="font-mono font-semibold">{inst.symbol}</span>
                <span className="block text-xs text-muted-foreground">{inst.name}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
              {inst.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
