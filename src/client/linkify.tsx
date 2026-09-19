"use client"

import * as React from "react"

import { cn } from "./cn"
import type { LinkifyOptions } from "../types"

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
const URL_PATTERN = /https?:\/\/[^\s]+/g
const TRAILING_PUNCTUATION_PATTERN = /[.,;:!?)\]}'"]+$/

function Anchor({
  href,
  newTab = true,
  className,
  children,
}: {
  href: string
  newTab?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={cn(
        "font-medium text-foreground underline underline-offset-4",
        className
      )}
    >
      {children}
    </a>
  )
}

function linkifyUrls(
  text: string,
  options: LinkifyOptions,
  keyPrefix: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0

  URL_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = URL_PATTERN.exec(text)) !== null) {
    const raw = match[0]
    const trailing = raw.match(TRAILING_PUNCTUATION_PATTERN)?.[0] ?? ""
    const url = trailing ? raw.slice(0, -trailing.length) : raw

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    nodes.push(
      <Anchor
        key={`${keyPrefix}-url-${match.index}`}
        href={url}
        newTab={options.newTab}
        className={options.className}
      >
        {url}
      </Anchor>
    )

    if (trailing) nodes.push(trailing)

    lastIndex = match.index + raw.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

/**
 * Turns bare URLs and `[label](url)` markdown into clickable links.
 * Returns an array of React nodes so it can be rendered inline.
 */
export function linkifyText(
  text: string,
  options: LinkifyOptions = {},
  keyPrefix = "link"
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0

  MARKDOWN_LINK_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = MARKDOWN_LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...linkifyUrls(
          text.slice(lastIndex, match.index),
          options,
          `${keyPrefix}-${lastIndex}`
        )
      )
    }

    nodes.push(
      <Anchor
        key={`${keyPrefix}-md-${match.index}`}
        href={match[2] ?? ""}
        newTab={options.newTab}
        className={options.className}
      >
        {match[1]}
      </Anchor>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(
      ...linkifyUrls(text.slice(lastIndex), options, `${keyPrefix}-${lastIndex}`)
    )
  }

  return nodes
}
