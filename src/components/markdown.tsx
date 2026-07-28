import type { ReactNode } from 'react'

/**
 * Lightweight Markdown renderer for AI-generated feedback.
 * Handles: **bold**, - bullet lists, 1. numbered lists, paragraphs.
 * No external dependencies required.
 */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.split('\n\n')
  const elements: ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!.trim()
    if (!block) continue

    const lines = block.split('\n')
    const isBulletList = lines.every((l) => /^[-*]\s/.test(l.trim()))
    const isNumberedList = lines.every((l) => /^\d+[.)]\s/.test(l.trim()))

    if (isBulletList) {
      elements.push(
        <ul key={i} className="my-1.5 space-y-1 pl-4">
          {lines.map((line, j) => (
            <li key={j} className="list-disc leading-relaxed">
              <InlineMarkdown text={line.trim().replace(/^[-*]\s+/, '')} />
            </li>
          ))}
        </ul>,
      )
    } else if (isNumberedList) {
      elements.push(
        <ol key={i} className="my-1.5 space-y-1 pl-4">
          {lines.map((line, j) => (
            <li key={j} className="list-decimal leading-relaxed">
              <InlineMarkdown text={line.trim().replace(/^\d+[.)]\s+/, '')} />
            </li>
          ))}
        </ol>,
      )
    } else {
      elements.push(
        <p key={i} className="my-1.5 leading-relaxed">
          {lines.map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              <InlineMarkdown text={line} />
            </span>
          ))}
        </p>,
      )
    }
  }

  return <div className={className}>{elements}</div>
}

function InlineMarkdown({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}
