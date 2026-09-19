# Contributing to infinite-faq

Thanks for wanting to help. This project is small and friendly — issues, docs,
examples and pull requests are all welcome.

## Ways to contribute

- **Report bugs** — open an issue with a minimal reproduction.
- **Suggest features** — open an issue describing the use case first.
- **Improve docs** — the README and this file.
- **Build examples** — Vue, Svelte, Remix, Hono, plain React, etc.
- **Work on the roadmap** — retrieval (Pinecone, Redis, pgvector), tool
  calling, conversation history. Open an issue before starting anything large.

## Getting started

```bash
# 1. Fork and clone
git clone https://github.com/<you>/infinite-faq.git
cd infinite-faq

# 2. Install dependencies
npm install

# 3. Typecheck and build
npm run typecheck
npm run build
```

### Try it end to end

The smoke test renders the component and calls a real model:

```bash
OPENROUTER_API_KEY=sk-or-... npm run smoke
```

The runnable example lives in `examples/nextjs`:

```bash
cd examples/nextjs
cp .env.example .env.local   # add OPENROUTER_API_KEY
npm install
npm run dev
```

## Project structure

```
src/
  index.ts                    # client entry, marked "use client"
  server.ts                   # framework-agnostic handler + Next route factory
  openrouter.ts               # OpenRouter convenience wrappers
  types.ts                    # shared public types
  client/                     # React: component, hook, transport, accordion, linkify
  server/                     # Request -> Response handler
examples/nextjs/              # minimal App Router example
scripts/                      # postbuild, smoke test
```

Keep the separation intact:

- `src/index.ts` and `src/client/**` must stay browser-safe. Never import
  `ai`, `@openrouter/ai-sdk-provider` or Node built-ins from the client entry.
- `src/server.ts` and `src/server/**` must not import React or browser APIs.
- The package ships ESM + CJS + `.d.ts`; add anything new to the `exports` map
  in `package.json` and keep the tsup entries in `tsup.config.ts` in sync.

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Rebuild on change (tsup watch) |
| `npm run build` | Clean build of all entries + types |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Render + live model smoke test |

## Code style

- TypeScript strict mode; no `any` unless unavoidable.
- No semicolons, double quotes, 2-space indentation.
- Prefer the existing patterns over new dependencies. The runtime dependency
  budget is intentionally tiny (`clsx`, `tailwind-merge`).
- Public API changes need types and a README update.
- Keep components designable: new visual elements should be overridable via
  `classNames` and driven by props, not hardcoded.
- Accessibility matters: keyboard-operable controls, `aria-expanded`, focus
  styles, and links that don't hijack the page.

## Adding a provider

`createFaqHandler` accepts any AI SDK `LanguageModel`. To add a convenience
wrapper (like the OpenRouter one):

1. Create `src/<provider>.ts` that builds the model and calls
   `createFaqHandler` / `createFaqRoute`.
2. Add an export path to `package.json` and an entry in `tsup.config.ts`.
3. Add the provider package as an **optional** peer dependency.
4. Document it in the README.

## Adding a transport

A transport is just an `AskFn`:

```ts
type AskFn = (
  question: string,
  context: { signal: AbortSignal }
) => string | AsyncIterable<string> | Promise<string | AsyncIterable<string>>
```

Add reusable transports under `src/client/` and export them from `src/index.ts`.

## Commits and pull requests

- Keep PRs focused; one change per PR.
- Write clear commit messages in the imperative mood
  (for example, `Add Redis retrieval adapter`).
- Describe what changed and why, and note any breaking changes.
- Make sure `npm run typecheck` and `npm run build` pass before opening a PR.
- Reference the issue your PR closes.

## Reporting bugs

Please include:

- `infinite-faq`, `ai`, React and Node versions
- Framework (Next.js version, or other)
- A minimal reproduction or code snippet
- What you expected vs. what happened
- The error output, if any

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
