import { streamText, type LanguageModel, type ModelMessage } from "ai"

/** A message accepted by the handler. */
export type FaqMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type FaqBody = {
  prompt?: unknown
  messages?: unknown
}

export type CreateFaqHandlerOptions = {
  /** Any AI SDK language model, for example `openrouter.chat("...")`. */
  model: LanguageModel
  /** System prompt. Scope the assistant to your product here. */
  system?: string
  /** Max execution time in seconds, surfaced by `createFaqRoute`. */
  maxDuration?: number
  /** Accept `role: "system"` messages from the client. Default `false`. */
  allowSystemMessages?: boolean
  /** CORS: `true` allows any origin, or pass an explicit allow-list. */
  cors?: boolean | string[]
  /** Called when a request or the stream fails. */
  onError?: (error: unknown) => void
}

const BASE_ROLES = ["user", "assistant"] as const
const ALL_ROLES = ["system", "user", "assistant"] as const

function normalizeMessages(
  body: FaqBody,
  allowSystemMessages: boolean
): ModelMessage[] {
  const roles: readonly string[] = allowSystemMessages ? ALL_ROLES : BASE_ROLES

  if (Array.isArray(body.messages)) {
    return body.messages.flatMap((message) => {
      if (typeof message !== "object" || message === null) return []

      const { role, content } = message as {
        role?: unknown
        content?: unknown
      }

      if (typeof role !== "string" || !roles.includes(role)) return []
      if (typeof content !== "string") return []

      return [{ role, content } as ModelMessage]
    })
  }

  if (typeof body.prompt === "string" && body.prompt.trim().length > 0) {
    return [{ role: "user", content: body.prompt }]
  }

  return []
}

function resolveCorsHeaders(
  cors: CreateFaqHandlerOptions["cors"],
  origin: string | null
): Record<string, string> {
  if (!cors) return {}

  const common = {
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  }

  if (cors === true) {
    return { "access-control-allow-origin": "*", ...common }
  }

  if (origin && cors.includes(origin)) {
    return {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      vary: "Origin",
      ...common,
    }
  }

  return {}
}

function withHeaders(response: Response, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  return response
}

/**
 * Creates a framework-agnostic `POST` handler that validates the body, calls
 * the model and returns a plain-text stream of the answer.
 */
export function createFaqHandler(options: CreateFaqHandlerOptions) {
  const {
    model,
    system,
    allowSystemMessages = false,
    cors,
    onError,
  } = options

  return async function POST(request: Request): Promise<Response> {
    const corsHeaders = resolveCorsHeaders(cors, request.headers.get("origin"))

    let body: FaqBody
    try {
      body = (await request.json()) as FaqBody
    } catch {
      return Response.json(
        { error: "Invalid JSON body." },
        { status: 400, headers: corsHeaders }
      )
    }

    const messages = normalizeMessages(body, allowSystemMessages)

    if (messages.length === 0) {
      return Response.json(
        { error: "Provide a non-empty `prompt` string or `messages` array." },
        { status: 400, headers: corsHeaders }
      )
    }

    try {
      const result = streamText({
        model,
        ...(system ? { system } : {}),
        messages,
        abortSignal: request.signal,
        onError: (event) => onError?.(event.error),
      })

      return withHeaders(result.toTextStreamResponse(), corsHeaders)
    } catch (error) {
      onError?.(error)
      return Response.json(
        { error: "Failed to generate a response." },
        { status: 500, headers: corsHeaders }
      )
    }
  }
}

/**
 * Returns Next.js App Router exports. Spread it into a `route.ts`:

 * ```ts
 * export const { POST, OPTIONS, maxDuration } = createFaqRoute({ model, system })
 * ```
 */
export function createFaqRoute(options: CreateFaqHandlerOptions) {
  const POST = createFaqHandler(options)

  async function OPTIONS(request: Request): Promise<Response> {
    const corsHeaders = resolveCorsHeaders(
      options.cors,
      request.headers.get("origin")
    )

    return new Response(null, { status: 204, headers: corsHeaders })
  }

  return {
    POST,
    OPTIONS,
    maxDuration: options.maxDuration,
  }
}
