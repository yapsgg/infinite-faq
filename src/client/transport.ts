import type { AskFn } from "../types"

export type EndpointAskOptions = {
  /** URL of the POST endpoint created with `createFaqRoute`. */
  endpoint: string
  /** Extra request headers (for example an auth token). */
  headers?: Record<string, string>
  /** Customize the request body. Defaults to `{ prompt: question }`. */
  body?: (question: string) => unknown
}

/**
 * Built-in transport that POSTs `{ prompt }` to an endpoint and reads the
 * response as a plain-text stream.
 */
export function createEndpointAsk({
  endpoint,
  headers,
  body,
}: EndpointAskOptions): AskFn {
  return async function ask(question, { signal }) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body ? body(question) : { prompt: question }),
      signal,
    })

    if (!response.ok || !response.body) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      throw new Error(
        data?.error ?? `Request failed with status ${response.status}`
      )
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          if (text) yield text
        }
      },
    }
  }
}
