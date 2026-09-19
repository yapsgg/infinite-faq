import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { InfiniteFaq } from "../dist/index.js"
import { createOpenRouterFaqRoute } from "../dist/openrouter.js"

const html = renderToStaticMarkup(
  React.createElement(InfiniteFaq, {
    endpoint: "/api/faq",
    title: "FAQ",
    items: [
      { question: "What is infinite-faq?", answer: "An AI-powered FAQ." },
      { question: "Is it stylable?", answer: "Yes, with Tailwind." },
    ],
  })
)

console.log("[client] renders input:", html.includes("Anything else?"))
console.log("[client] renders static Q:", html.includes("What is infinite-faq?"))

const { POST } = createOpenRouterFaqRoute({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-v4.1-flash",
  system:
    "You are the assistant for the infinite-faq package. Answer in one short sentence.",
})

const response = await POST(
  new Request("http://localhost/api/faq", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "What is infinite-faq?" }),
  })
)
console.log("[server] status:", response.status)
console.log("[server] content-type:", response.headers.get("content-type"))
console.log("[server] body:", (await response.text()).trim())

const bad = await POST(
  new Request("http://localhost/api/faq", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })
)
console.log("[server] empty body status:", bad.status)
