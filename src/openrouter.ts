import { createOpenRouter } from "@openrouter/ai-sdk-provider"

import {
  createFaqHandler,
  createFaqRoute,
  type CreateFaqHandlerOptions,
} from "./server/create-faq-handler"

export type CreateOpenRouterFaqOptions = Omit<
  CreateFaqHandlerOptions,
  "model"
> & {
  /** OpenRouter API key. Defaults to the `OPENROUTER_API_KEY` env var. */
  apiKey?: string
  /** Model id, for example `deepseek/deepseek-v4.1-flash`. */
  model: string
  /** App name used for OpenRouter attribution. */
  appName?: string
  /** App URL used for OpenRouter attribution. */
  appUrl?: string
  compatibility?: "strict" | "compatible"
}

function buildOptions(
  options: CreateOpenRouterFaqOptions
): CreateFaqHandlerOptions {
  const {
    apiKey,
    model,
    appName,
    appUrl,
    compatibility = "strict",
    ...rest
  } = options

  const provider = createOpenRouter({
    apiKey,
    appName,
    appUrl,
    compatibility,
  })

  return { ...rest, model: provider.chat(model) }
}

/** `createFaqHandler` wired to OpenRouter. */
export function createOpenRouterFaqHandler(
  options: CreateOpenRouterFaqOptions
) {
  return createFaqHandler(buildOptions(options))
}

/** `createFaqRoute` wired to OpenRouter. */
export function createOpenRouterFaqRoute(
  options: CreateOpenRouterFaqOptions
) {
  return createFaqRoute(buildOptions(options))
}
