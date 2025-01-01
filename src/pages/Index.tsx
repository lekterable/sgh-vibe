import { useState } from "react";
import { useMarketData, useForecast, useInsight } from "@/data/hooks";
import InstrumentSelector from "@/components/InstrumentSelector";
import PriceHeader from "@/components/PriceHeader";
import PriceChart from "@/components/PriceChart";
import ForecastChart from "@/components/ForecastChart";
import InsightPanel from "@/components/InsightPanel";
import MarketAssistantBubble from "@/components/assistant/MarketAssistantBubble";
import StatsBar from "@/components/StatsBar";
import ThemeToggle from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { buildMarketAssistantContext } from "@/lib/market-assistant-context";
import { BarChart3, Brain, TrendingUp } from "lucide-react";

export default function Index() {
  const [symbol, setSymbol] = useState("AAPL");

  const {
    data: marketData,
    isLoading: loadingMarket,
    error: marketError,
  } = useMarketData(symbol);
  const { data: forecast, isLoading: loadingForecast } = useForecast(symbol);
  const { data: insight, isLoading: loadingInsight } = useInsight(symbol);
  const marketAssistantContext = buildMarketAssistantContext({
    forecast,
    insight,
    marketData,
    symbol,
  });
  const marketErrorMessage =
    marketError instanceof Error ? marketError.message : "Unable to load market data right now.";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">MarketLens</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
              EDU
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Instruments
              </h2>
              <InstrumentSelector selected={symbol} onSelect={setSymbol} />
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-5">
            {/* Price header */}
            <div className="bg-card border border-border rounded-lg p-5">
              {loadingMarket || !marketData ? (
                marketError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {marketErrorMessage}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                )
              ) : (
                <PriceHeader data={marketData} />
              )}
            </div>

            {/* Stats */}
            {marketData && <StatsBar prices={marketData.prices} />}

            {/* Price chart */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Price & Volume
              </h2>
              {loadingMarket || !marketData ? (
                marketError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {marketErrorMessage}
                  </div>
                ) : (
                  <Skeleton className="h-[440px] w-full rounded-lg" />
                )
              ) : (
                <PriceChart prices={marketData.prices} />
              )}
            </div>

            {/* Forecast + Insight row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-chart-forecast" />
                  30-Day Forecast
                </h2>
                <ForecastChart
                  prices={marketData?.prices || []}
                  forecast={forecast}
                  isLoading={loadingForecast}
                />
                <p className="text-[10px] text-muted-foreground mt-3">
                  Based on weighted moving average crossover with volatility-adjusted confidence bands.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  AI Insight
                </h2>
                {marketError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {marketErrorMessage}
                  </div>
                ) : (
                  <InsightPanel insight={insight} isLoading={loadingInsight} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <MarketAssistantBubble marketContext={marketAssistantContext} symbol={symbol} />
    </div>
  );
}
