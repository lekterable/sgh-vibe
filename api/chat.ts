import type { UIMessage } from "ai";

import { streamMarketAssistantResponse, type MarketAssistantRequestBody } from "../server/market-assistant";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
    });
  }

  try {
    const body = (await request.json()) as Partial<MarketAssistantRequestBody>;
    const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : [];

    const result = await streamMarketAssistantResponse({
      abortSignal: request.signal,
      marketContext: body.marketContext,
      messages,
      symbol: body.symbol,
      system: body.system,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate a response.";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
