# infinite-faq

AI-powered, infinitely growing FAQ. Keep your static questions, then add an
**"Anything else?"** input where visitors ask their own question, have the
answer stream in, and watch it slide into the list as a new FAQ item.

Full-stack and fully designable with Tailwind. Bring your own key, model and
system prompt.

<p align="center">
  <video
    src="https://github.com/user-attachments/assets/b65a1ef3-a3fd-49a8-8c63-903fc01c4e7f"
    controls
    muted
    loop
    playsinline
    width="720"
  ></video>
</p>

- **Streaming answers** — text appears as it is generated.
- **Headless or styled** — use `InfiniteFaq` as-is or the `useInfiniteFaq` hook.
- **Bring your own model** — any [AI SDK](https://ai-sdk.dev) model, with a
  one-line OpenRouter helper.
- **Designable** — every part accepts `classNames`, or override with Tailwind.
- **Scoped** — lock the assistant to your site with a system prompt and an
  optional knowledge list.
- **Zero-config transport** — a Next.js route factory plus a generic `Request`
  handler.

## Install

```bash
npm install infinite-faq ai
# optional, for the OpenRouter helper
npm install @openrouter/ai-sdk-provider
```

## Tailwind setup

`infinite-faq` ships Tailwind class names, so your Tailwind build must scan the
package:

**Tailwind v4** (`app/globals.css`):

```css
@import "tailwindcss";
@source "../node_modules/infinite-faq/dist";
```

**Tailwind v3** (`tailwind.config.ts`):

```ts
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/infinite-faq/dist/**/*.{js,cjs}",
  ],
}
```

The default styles use shadcn-style tokens (`bg-card`, `text-muted-foreground`,
`border-border`, `text-destructive`, `ring-ring`). If you don't use those, pass
`classNames` to match your design system, or map the tokens in `@theme`.

## Quick start (Next.js App Router)

### 1. Create the route

`app/api/faq/route.ts`

```ts
import { createOpenRouterFaqRoute } from "infinite-faq/openrouter"

export const { POST, OPTIONS, maxDuration } = createOpenRouterFaqRoute({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-v4.1-flash",
  system: `You are the assistant for ACME. Only answer questions about ACME
and its products. Keep answers to 1-3 short sentences.`,
})
```

### 2. Render the component

```tsx
import { InfiniteFaq } from "infinite-faq"

export function Faq() {
  return (
    <InfiniteFaq
      endpoint="/api/faq"
      eyebrow="FAQ"
      title="Frequently asked questions"
      items={[
        { question: "What is ACME?", answer: "ACME makes everything." },
        { question: "How much does it cost?", answer: "One-time $1,999." },
      ]}
    />
  )
}
```

That's it — static items, plus an input where visitors ask anything and the
streamed answer is appended to the list.

## Custom styling

Every part is overridable, and `maxLines` clamps answers with a scroll.

```tsx
<InfiniteFaq
  endpoint="/api/faq"
  items={items}
  placeholder="Ask us anything…"
  loadingText="Searching our docs…"
  maxLines={6}
  className="max-w-3xl"
  classNames={{
    item: "rounded-3xl border-neutral-800 bg-neutral-950",
    trigger: "py-6 text-lg",
    answer: "text-neutral-400",
    form: "rounded-3xl border-neutral-800",
  }}
/>
```

| `classNames` key | Applies to |
| --- | --- |
| `root`, `header`, `title`, `description`, `list` | Layout |
| `item`, `trigger`, `question`, `icon`, `content`, `answer` | Each Q&A item |
| `loading`, `error` | Generated answer states |
| `form`, `input`, `submit` | The "Anything else?" row |

Other useful props: `submitIcon`, `renderIcon({ open })`, `duration`, `linkify`,
`linkClassName`, `defaultOpenIndex`, `errorMessage`, `onEntryAdded`, `onError`.

## Headless usage

Build any UI you want; keep streaming, cancellation and state for free.

```tsx
"use client"
import { useInfiniteFaq, createEndpointAsk } from "infinite-faq"

const ask = createEndpointAsk({ endpoint: "/api/faq" })

function MyFaq() {
  const { entries, ask: askQuestion, isLoading } = useInfiniteFaq({ ask })

  return (
    <div>
      {entries.map((entry) => (
        <article key={entry.id}>
          <h3>{entry.question}</h3>
          <p>{entry.answer || (isLoading ? "…" : "")}</p>
        </article>
      ))}
      <button onClick={() => askQuestion("How does it work?")}>Ask</button>
    </div>
  )
}
```

## Bring your own model

`createFaqHandler` accepts any AI SDK `LanguageModel`, so you are not locked to
OpenRouter.

```ts
import { createFaqRoute } from "infinite-faq/server"
import { openai } from "@ai-sdk/openai"

export const { POST, maxDuration } = createFaqRoute({
  model: openai("gpt-4o-mini"),
  system: "You are ACME's FAQ assistant.",
})
```

The handler also works as a plain `Request`/`Response` function — use it in
Remix, Hono, Bun, Deno or any runtime:

```ts
import { createFaqHandler } from "infinite-faq/server"

const handleFaq = createFaqHandler({ model, system })
// handleFaq(request) -> Response
```

## Server API

### `createFaqRoute(options)`

Returns `{ POST, OPTIONS, maxDuration }` for a Next.js route file.

| Option | Type | Description |
| --- | --- | --- |
| `model` | `LanguageModel` | Required. Any AI SDK model. |
| `system` | `string` | System prompt; scope the assistant here. |
| `maxDuration` | `number` | Seconds; re-exported as `maxDuration`. |
| `allowSystemMessages` | `boolean` | Accept `system` messages from the client. Default `false`. |
| `cors` | `true \| string[]` | Allow any origin or an allow-list. |
| `onError` | `(error) => void` | Called on request/stream failure. |

The endpoint accepts `{ prompt: string }` or
`{ messages: { role, content }[] }` and responds with a `text/plain` stream.
Errors are returned as JSON `{ error }` with a 4xx/5xx status.

### `createOpenRouterFaqRoute(options)` / `createOpenRouterFaqHandler(options)`

Everything above, plus `apiKey`, `model` (id string), `appName`, `appUrl` and
`compatibility`. Import from `infinite-faq/openrouter`.

## Roadmap

- [ ] Pluggable retrieval (Pinecone, Redis, pgvector) for grounded answers
- [ ] Tool calling (e.g. fetch pricing, check order status)
- [ ] Conversation history in `InfiniteFaq`
- [ ] React Server Component / no-JS streaming variant
- [ ] Vue and Svelte bindings on the same headless core

## License

MIT
