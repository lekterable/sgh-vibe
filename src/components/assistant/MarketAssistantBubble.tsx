import { useMemo, useState } from "react";
import { AssistantRuntimeProvider, AuiIf, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { ArrowUp, Bot, Brain, ChevronDown, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MarketAssistantBubbleProps {
  marketContext: string;
  symbol: string;
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="rounded-[1.4rem] border border-border/70 bg-background/95 p-2 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.6)]">
      <div className="rounded-[1rem] bg-muted/40 px-3 py-2">
        <ComposerPrimitive.Input
          autoFocus
          className="min-h-[52px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
          placeholder="Ask about momentum, risks, or what the forecast is signaling..."
          rows={3}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 px-1">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Educational analysis only. Configure <code>AI_GATEWAY_API_KEY</code> on the server to enable replies.
        </p>
        <ComposerPrimitive.Send asChild>
          <Button className="h-11 rounded-full px-4" size="sm">
            Send
            <ArrowUp className="h-4 w-4" />
          </Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[84%] rounded-[1.4rem] rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-[0_18px_45px_-30px_hsl(var(--primary)/0.85)]">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type !== "text") return null;
            return <div>{part.text}</div>;
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[88%] rounded-[1.4rem] rounded-tl-md border border-border/70 bg-card px-4 py-3 text-sm leading-7 text-foreground shadow-[0_24px_40px_-34px_hsl(var(--foreground)/0.55)]">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type !== "text") return null;
            return (
              <MarkdownTextPrimitive className="prose prose-sm max-w-none prose-p:my-0 prose-strong:text-foreground prose-li:my-0.5 dark:prose-invert" />
            );
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function SuggestionPill({ prompt }: { prompt: string }) {
  return (
    <ThreadPrimitive.Suggestion
      className="rounded-full border border-border/70 bg-background/80 px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      prompt={prompt}
      send
    >
      {prompt}
    </ThreadPrimitive.Suggestion>
  );
}

function MarketAssistantThread({ symbol }: Pick<MarketAssistantBubbleProps, "symbol">) {
  return (
    <ThreadPrimitive.Root className="relative flex h-full flex-col overflow-hidden">
      <ThreadPrimitive.Viewport className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-4">
        <AuiIf condition={(state) => state.thread.isEmpty}>
          <div className="space-y-5 px-1 pt-2">
            <div className="rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--primary)/0.14),transparent)] p-4">
              <Badge className="mb-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-primary shadow-none">
                Active Lens
              </Badge>
              <h3 className="max-w-[16ch] text-lg font-semibold leading-tight text-foreground">
                Ask for the signal behind {symbol}, not just the number.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                I can summarize the chart setup, explain the forecast, or call out risk pockets using the dashboard
                context you already have on screen.
              </p>
            </div>

            <div className="grid gap-2">
              <SuggestionPill prompt={`Summarize the current ${symbol} trend in plain English.`} />
              <SuggestionPill prompt={`What are the biggest risks showing up for ${symbol} right now?`} />
              <SuggestionPill prompt={`Explain the 30-day forecast for ${symbol} like I'm briefing a teammate.`} />
            </div>
          </div>
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            AssistantMessage,
            UserMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <ThreadPrimitive.ScrollToBottom asChild>
        <button className="absolute bottom-28 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground">
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">Scroll to latest message</span>
        </button>
      </ThreadPrimitive.ScrollToBottom>

      <ThreadPrimitive.ViewportFooter className="border-t border-border/70 bg-background/95 px-5 pb-5 pt-4 backdrop-blur">
        <Composer />
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Root>
  );
}

export default function MarketAssistantBubble({ marketContext, symbol }: MarketAssistantBubbleProps) {
  const [open, setOpen] = useState(false);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async (request) => ({
          ...request,
          body: {
            ...request.body,
            marketContext,
            symbol,
          },
        }),
      }),
    [marketContext, symbol],
  );

  const runtime = useChatRuntime({
    transport,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Sheet open={open} onOpenChange={setOpen}>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-primary/20 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--primary)/0.14)_100%)] px-4 py-3 text-left shadow-[0_24px_60px_-28px_hsl(var(--primary)/0.65)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5",
            open && "scale-[0.98]",
          )}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-chart-forecast" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Ask MarketLens AI</span>
              <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary shadow-none">
                {symbol}
              </Badge>
            </div>
            <p className="max-w-[19rem] text-xs text-muted-foreground">
              Open a live chat grounded in the chart, forecast, and current insight panel.
            </p>
          </div>
        </button>

        <SheetContent
          aria-describedby="market-assistant-description"
          className="inset-y-auto left-auto right-4 top-auto h-[min(78vh,720px)] w-[min(calc(100vw-2rem),440px)] rounded-[2rem] border border-border/80 p-0 sm:max-w-none"
          side="right"
        >
          <div className="flex h-full flex-col overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_45%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
            <SheetHeader className="gap-3 border-b border-border/70 px-5 pb-4 pt-5 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <SheetTitle className="text-base">MarketLens AI</SheetTitle>
                      <SheetDescription id="market-assistant-description" className="text-xs">
                        Streaming analysis for {symbol} using the current dashboard context.
                      </SheetDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-secondary-foreground shadow-none">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Chart-aware
                    </Badge>
                    <Badge className="rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-secondary-foreground shadow-none">
                      Educational only
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1">
              <MarketAssistantThread symbol={symbol} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AssistantRuntimeProvider>
  );
}
