import { createOpenRouterFaqRoute } from "infinite-faq/openrouter"

export const { POST, OPTIONS, maxDuration } = createOpenRouterFaqRoute({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-v4.1-flash",
  system: `You are the assistant for the infinite-faq open source package.
Only answer questions about infinite-faq: what it is, how to install it, how to
style it, how to plug in a model, and its roadmap. Politely decline anything
unrelated. Keep answers to 1-3 short sentences.`,
})
