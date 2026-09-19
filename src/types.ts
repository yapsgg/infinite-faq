import type { ReactNode } from "react"

/** A static question and answer rendered in the list. */
export type FaqItem = {
  /** Optional stable id. Generated from the question when omitted. */
  id?: string
  question: string
  answer: ReactNode
}

/** Status of an entry generated from a visitor question. */
export type FaqEntryStatus = "loading" | "done" | "error"

/** A generated question and streamed answer. */
export type FaqEntry = {
  id: string
  question: string
  answer: string
  status: FaqEntryStatus
}

/** Passed to a custom `ask` function so it can cancel in-flight work. */
export type AskContext = {
  signal: AbortSignal
}

/**
 * The result of asking a question. Return a string for a one-shot answer, or
 * an async iterable / `ReadableStream` to stream chunks as they arrive.
 */
export type AskResult = string | AsyncIterable<string>

/**
 * The pluggable transport used by `InfiniteFaq`. Bring your own backend, or
 * pass an `endpoint` and the built-in transport is used.
 */
export type AskFn = (
  question: string,
  context: AskContext
) => AskResult | Promise<AskResult>

/** Class overrides for every part of the component. */
export type InfiniteFaqClassNames = {
  root?: string
  header?: string
  title?: string
  description?: string
  list?: string
  item?: string
  trigger?: string
  question?: string
  icon?: string
  content?: string
  answer?: string
  loading?: string
  error?: string
  form?: string
  input?: string
  submit?: string
}

export type LinkifyOptions = {
  /** Open links in a new tab. Defaults to `true`. */
  newTab?: boolean
  /** Extra class names applied to generated links. */
  className?: string
}
