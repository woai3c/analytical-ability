interface TextBlock {
  key: number
  text: string
  lines: string[]
}

export function parseTextBlocks(text: string): TextBlock[] {
  return text.split('\n\n').flatMap((block, key) => {
    const trimmed = block.trim()
    return trimmed ? [{ key, text: trimmed, lines: trimmed.split('\n') }] : []
  })
}
