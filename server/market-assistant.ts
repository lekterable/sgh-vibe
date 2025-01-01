import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const MARKET_ASSISTANT_MODEL = "openai/gpt-5.4-mini";

export interface MarketAssistantRequestBody {
  messages: UIMessage[];
  marketContext?: string;
  symbol?: string;
  system?: string;
}

interface StreamMarketAssistantOptions extends MarketAssistantRequestBody {
  abortSignal?: AbortSignal;
}

function buildSystemPrompt({ marketContext, symbol, system }: Omit<MarketAssistantRequestBody, "messages">) {
  const promptSections = [
    "You are MarketLens AI, an educational market-analysis copilot inside a chart-focused dashboard.",
    "Use the dashboard context when it is relevant, but be honest when the question goes beyond the provided context.",
    "Never claim to have real-time market access, brokerage capabilities, or certainty about future price action.",
    "Keep answers concise, practical, and easy to scan. Prefer short paragraphs or compact bullet lists.",
    "Do not give personalized financial advice. Frame guidance as educational analysis only.",
  ];

  if (symbol) {
    promptSections.push(`The user is currently focused on ${symbol}.`);
  }

  if (marketContext) {
    promptSections.push(`Dashboard context:\n${marketContext}`);
  }

  if (system) {
    promptSections.push(`Additional runtime instructions:\n${system}`);
  }

  return promptSections.join("\n\n");
}

export async function streamMarketAssistantResponse({
  abortSignal,
  marketContext,
  messages,
  symbol,
  system,
}: StreamMarketAssistantOptions) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("Missing AI_GATEWAY_API_KEY. Add it to your server environment to enable chat.");
  }

  return streamText({
    abortSignal,
    model: MARKET_ASSISTANT_MODEL,
    system: buildSystemPrompt({ marketContext, symbol, system }),
    messages: await convertToModelMessages(messages),
  });
}
