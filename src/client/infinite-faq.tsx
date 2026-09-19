"use client"

import * as React from "react"

import { AccordionItem } from "./accordion"
import { cn } from "./cn"
import { PlusIcon, SpinnerIcon } from "./icons"
import { linkifyText } from "./linkify"
import { createEndpointAsk } from "./transport"
import { useInfiniteFaq } from "./use-infinite-faq"
import type {
  AskFn,
  FaqEntry,
  FaqItem,
  InfiniteFaqClassNames,
} from "../types"

export type InfiniteFaqProps = {
  /** Static questions shown above the input. */
  items?: FaqItem[]
  /** Endpoint created with `createFaqRoute`. Defaults to `/api/faq`. */
  endpoint?: string
  /** Extra request headers for the built-in endpoint transport. */
  headers?: Record<string, string>
  /** Bring your own transport. Overrides `endpoint`. */
  ask?: AskFn
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
  loadingText?: string
  errorMessage?: string
  /** Which static item is open on mount. Defaults to the first. */
  defaultOpenIndex?: number
  /** Clamp answers to N lines and scroll the rest. */
  maxLines?: number
  /** Auto-link URLs and markdown links in generated answers. Default `true`. */
  linkify?: boolean
  linkClassName?: string
  /** Accordion expand duration in milliseconds. Default `200`. */
  duration?: number
  className?: string
  classNames?: InfiniteFaqClassNames
  submitIcon?: React.ReactNode
  renderIcon?: (context: { open: boolean }) => React.ReactNode
  onEntryAdded?: (entry: FaqEntry) => void
  onError?: (error: unknown, question: string) => void
}

const DEFAULT_ENDPOINT = "/api/faq"

export function InfiniteFaq({
  items = [],
  endpoint = DEFAULT_ENDPOINT,
  headers,
  ask,
  eyebrow,
  title,
  description,
  placeholder = "Anything else?",
  loadingText = "Thinking…",
  errorMessage,
  defaultOpenIndex = 0,
  maxLines,
  linkify = true,
  linkClassName,
  duration = 200,
  className,
  classNames,
  submitIcon,
  renderIcon,
  onEntryAdded,
  onError,
}: InfiniteFaqProps) {
  const staticItems = React.useMemo(
    () =>
      items.map((item, index) => ({
        id: item.id ?? `infinite-faq-item-${index}`,
        question: item.question,
        answer: item.answer,
      })),
    [items]
  )

  const askFn = React.useMemo<AskFn>(
    () => ask ?? createEndpointAsk({ endpoint, headers }),
    [ask, endpoint, headers]
  )

  const [value, setValue] = React.useState("")
  const [openId, setOpenId] = React.useState<string | undefined>(
    staticItems[defaultOpenIndex]?.id
  )
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleEntryAdded = React.useCallback(
    (entry: FaqEntry) => {
      setOpenId(entry.id)
      onEntryAdded?.(entry)
    },
    [onEntryAdded]
  )

  const { entries, ask: askQuestion } = useInfiniteFaq({
    ask: askFn,
    errorMessage,
    onError,
    onEntryAdded: handleEntryAdded,
  })

  const answerMaxHeight =
    maxLines && maxLines > 0 ? `calc(${maxLines} * 1.625em)` : undefined

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const question = value.trim()
    if (!question) return

    setValue("")
    void askQuestion(question)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("w-full", className, classNames?.root)}>
      {(eyebrow || title || description) && (
        <div className={cn("mb-8 flex flex-col gap-4", classNames?.header)}>
          {eyebrow ? (
            <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h2
              className={cn(
                "text-3xl font-semibold tracking-tight text-balance sm:text-4xl",
                classNames?.title
              )}
            >
              {title}
            </h2>
          ) : null}
          {description ? (
            <p
              className={cn(
                "max-w-2xl text-base leading-relaxed text-muted-foreground",
                classNames?.description
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div className={cn("flex w-full flex-col gap-3", classNames?.list)}>
        {staticItems.map((item) => (
          <AccordionItem
            key={item.id}
            question={item.question}
            open={openId === item.id}
            onToggle={() =>
              setOpenId(openId === item.id ? undefined : item.id)
            }
            duration={duration}
            classNames={classNames}
            icon={renderIcon?.({ open: openId === item.id })}
          >
            {item.answer}
          </AccordionItem>
        ))}

        {entries.map((entry) => {
          const isLoading = entry.status === "loading" && !entry.answer

          return (
            <AccordionItem
              key={entry.id}
              question={entry.question}
              open={openId === entry.id}
              onToggle={() =>
                setOpenId(openId === entry.id ? undefined : entry.id)
              }
              duration={duration}
              classNames={classNames}
              icon={renderIcon?.({ open: openId === entry.id })}
            >
              {isLoading ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-2",
                    classNames?.loading
                  )}
                >
                  <SpinnerIcon className="size-4 animate-spin" />
                  {loadingText}
                </span>
              ) : entry.status === "error" ? (
                <span
                  className={cn("text-destructive", classNames?.error)}
                >
                  {entry.answer}
                </span>
              ) : (
                <span
                  style={{
                    display: "block",
                    maxHeight: answerMaxHeight,
                    overflowY: answerMaxHeight ? "auto" : undefined,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {linkify
                    ? linkifyText(
                        entry.answer,
                        { className: linkClassName },
                        entry.id
                      )
                    : entry.answer}
                </span>
              )}
            </AccordionItem>
          )
        })}

        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-card px-5 transition-colors focus-within:border-ring/50",
            classNames?.form
          )}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            className={cn(
              "w-full flex-1 bg-transparent py-5 text-left text-base font-medium text-foreground outline-none placeholder:text-muted-foreground",
              classNames?.input
            )}
          />
          <button
            type="submit"
            disabled={value.trim().length === 0}
            aria-label="Ask"
            className={cn(
              "shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
              classNames?.submit
            )}
          >
            {submitIcon ?? <PlusIcon className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
