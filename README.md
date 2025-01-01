# Welcome to your Lovable project

## AI chat setup

The app now includes a floating MarketLens AI assistant powered by the Vercel AI SDK and `assistant-ui`.

To enable responses, add this server environment variable:

```bash
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
```

The local Vite dev server also serves `/api/chat`, so `npm run dev` is enough once the key is configured.
