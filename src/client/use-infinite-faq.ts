"use client"

import * as React from "react"

import type { AskFn, FaqEntry } from "../types"

export type UseInfiniteFaqOptions = {
  ask: AskFn
  errorMessage?: string
  onError?: (error: unknown, question: string) => void
  onEntryAdded?: (entry: FaqEntry) => void
}

export type UseInfiniteFaqResult = {
  entries: FaqEntry[]
  ask: (question: string) => Promise<void>
  isLoading: boolean
  remove: (id: string) => void
  clear: () => void
}

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

/**
 * Headless state machine behind `InfiniteFaq`. Use it to build a fully custom
 * UI while keeping streaming, error handling and cancellation for free.
 */
export function useInfiniteFaq({
  ask: askFn,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  onError,
  onEntryAdded,
}: UseInfiniteFaqOptions): UseInfiniteFaqResult {
  const [entries, setEntries] = React.useState<FaqEntry[]>([])
  const controllers = React.useRef<Set<AbortController>>(new Set())
  const counter = React.useRef(0)

  React.useEffect(() => {
    const active = controllers.current
    return () => {
      active.forEach((controller) => controller.abort())
      active.clear()
    }
  }, [])

  const update = React.useCallback((id: string, patch: Partial<FaqEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    )
  }, [])

  const ask = React.useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed) return

      counter.current += 1
      const id = `infinite-faq-${Date.now()}-${counter.current}`
      const controller = new AbortController()
      controllers.current.add(controller)

      const entry: FaqEntry = {
        id,
        question: trimmed,
        answer: "",
        status: "loading",
      }

      setEntries((prev) => [...prev, entry])
      onEntryAdded?.(entry)

      try {
        const result = await askFn(trimmed, { signal: controller.signal })
        let answer = ""

        if (typeof result === "string") {
          answer = result
        } else {
          for await (const chunk of result) {
            if (controller.signal.aborted) return
            answer += chunk
            update(id, { answer })
          }
        }

        if (!answer.trim()) throw new Error(errorMessage)

        update(id, { answer, status: "done" })
      } catch (error) {
        if (controller.signal.aborted) return

        onError?.(error, trimmed)
        update(id, {
          status: "error",
          answer: error instanceof Error ? error.message : errorMessage,
        })
      } finally {
        controllers.current.delete(controller)
      }
    },
    [askFn, errorMessage, onError, onEntryAdded, update]
  )

  const remove = React.useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const clear = React.useCallback(() => setEntries([]), [])

  return {
    entries,
    ask,
    isLoading: entries.some((entry) => entry.status === "loading"),
    remove,
    clear,
  }
}
