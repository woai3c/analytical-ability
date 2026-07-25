import ReactMarkdown from 'react-markdown'

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ node: _node, ...props }) => <p className="leading-6 [&:not(:first-child)]:mt-2" {...props} />,
        strong: ({ node: _node, ...props }) => <strong className="font-medium text-foreground" {...props} />,
        em: ({ node: _node, ...props }) => <em {...props} />,
        ul: ({ node: _node, ...props }) => <ul className="mt-1 list-disc space-y-1 pl-4" {...props} />,
        ol: ({ node: _node, ...props }) => <ol className="mt-1 list-decimal space-y-1 pl-4" {...props} />,
        li: ({ node: _node, ...props }) => <li className="leading-6" {...props} />,
        code: ({ node: _node, ...props }) => (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]" {...props} />
        ),
        a: ({ node: _node, ...props }) => (
          <a
            className="text-accent-foreground underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        h1: ({ node: _node, ...props }) => <p className="mt-2 font-medium text-foreground" {...props} />,
        h2: ({ node: _node, ...props }) => <p className="mt-2 font-medium text-foreground" {...props} />,
        h3: ({ node: _node, ...props }) => <p className="mt-2 font-medium text-foreground" {...props} />,
        h4: ({ node: _node, ...props }) => <p className="mt-2 font-medium text-foreground" {...props} />,
        blockquote: ({ node: _node, ...props }) => (
          <blockquote className="mt-2 border-l-2 border-border pl-3 text-muted-foreground" {...props} />
        ),
        hr: () => <hr className="my-3 border-border" />,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
