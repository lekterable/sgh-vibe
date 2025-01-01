import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { componentTagger } from "lovable-tagger";
import type { UIMessage } from "ai";

import { streamMarketAssistantResponse, type MarketAssistantRequestBody } from "./server/market-assistant";

async function readJsonBody(request: IncomingMessage) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? (JSON.parse(rawBody) as Partial<MarketAssistantRequestBody>) : {};
}

function sendJsonError(response: ServerResponse, message: string, status = 500) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ error: message }));
}

function registerMarketAssistantApi(middlewares: {
  use: (route: string, handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void;
}) {
  middlewares.use("/api/chat", async (request, response) => {
    if (request.method !== "POST") {
      sendJsonError(response, "Method not allowed", 405);
      return;
    }

    const abortController = new AbortController();
    request.on("close", () => abortController.abort());

    try {
      const body = await readJsonBody(request);
      const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : [];
      const result = await streamMarketAssistantResponse({
        abortSignal: abortController.signal,
        marketContext: body.marketContext,
        messages,
        symbol: body.symbol,
        system: body.system,
      });

      result.pipeUIMessageStreamToResponse(response, {
        originalMessages: messages,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate a response.";
      sendJsonError(response, message);
    }
  });
}

const marketAssistantApi = () => ({
  name: "market-assistant-api",
  configurePreviewServer(server: { middlewares: Parameters<typeof registerMarketAssistantApi>[0] }) {
    registerMarketAssistantApi(server.middlewares);
  },
  configureServer(server: { middlewares: Parameters<typeof registerMarketAssistantApi>[0] }) {
    registerMarketAssistantApi(server.middlewares);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), marketAssistantApi(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
