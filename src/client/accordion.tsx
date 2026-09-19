"use client"

import * as React from "react"

import { cn } from "./cn"
import { PlusIcon } from "./icons"
import type { InfiniteFaqClassNames } from "../types"

type AccordionItemProps = {
  question: React.ReactNode
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  icon?: React.ReactNode
  duration?: number
  classNames?: Pick<
    InfiniteFaqClassNames,
    "item" | "trigger" | "question" | "icon" | "content" | "answer"
  >
}

export function AccordionItem({
  question,
  open,
  onToggle,
  children,
  icon,
  duration = 200,
  classNames,
}: AccordionItemProps) {
  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-colors",
        classNames?.item
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          "flex w-full items-start justify-between gap-4 px-5 py-5 text-left text-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
          classNames?.trigger
        )}
      >
        <span className={cn("flex-1", classNames?.question)}>{question}</span>
        <span
          aria-hidden="true"
          data-state={open ? "open" : "closed"}
          className={cn(
            "mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-45",
            classNames?.icon
          )}
        >
          {icon ?? <PlusIcon className="size-4" />}
        </span>
      </button>
      <div
        className={cn("grid", classNames?.content)}
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: `grid-template-rows ${duration}ms ease`,
        }}
      >
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div
            className={cn(
              "px-5 pb-5 text-sm leading-relaxed text-muted-foreground",
              classNames?.answer
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
