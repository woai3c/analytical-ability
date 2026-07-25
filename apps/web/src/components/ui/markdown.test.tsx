import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Markdown } from '@/components/ui/markdown'

describe('Markdown', () => {
  it('renders bold text instead of raw markdown syntax', () => {
    const { container } = render(<Markdown>{'这是 **重点** 内容'}</Markdown>)
    const bold = container.querySelector('strong')
    expect(bold).not.toBeNull()
    expect(bold?.textContent).toBe('重点')
    expect(container.textContent).not.toContain('**')
  })

  it('renders lists', () => {
    render(<Markdown>{'- 第一项\n- 第二项'}</Markdown>)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
