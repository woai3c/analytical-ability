# Clarity — Learn How to Analyze

Don't just get answers. Build the skill to find them yourself.

Clarity is a training platform for analytical thinking. It teaches you **when** and **how** to apply methods like Fishbone diagrams, 5 Whys, MCDA, and more — through AI-generated scenarios and immediate feedback.

[中文](./README.md)

## Features

- **Method Library** — 12 analysis methods with full introductions, step-by-step guides, and worked examples
- **Scenario Training** — AI generates realistic problems; you choose the right method, explain your reasoning, and get detailed feedback
- **Progress Tracking** — Review your practice history by scenario type and method

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment (fill in at least one API key)
cp .env.example .env

# Start dev server
pnpm dev
```

Default URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:8787`

## LLM Configuration

Add any supported provider's API key to `.env`:

```dotenv
DEEPSEEK_API_KEY=your-key-here
```

Supported providers: DeepSeek, Anthropic, OpenAI, Google Gemini, xAI, Qwen, Zhipu, Moonshot, and any OpenAI-compatible endpoint.

The system automatically selects the first configured provider. No manual model selection needed.

## Tech Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Frontend        | React + Vite + Tailwind CSS |
| Backend         | Fastify + Vercel AI SDK     |
| Language        | TypeScript (monorepo)       |
| Package Manager | pnpm workspaces             |

## Project Structure

```
apps/web                  React web application
apps/api                  Fastify API server
packages/domain           Shared types and contracts
packages/analysis-engine  Method registry and rules
packages/llm              Multi-provider LLM adapter
packages/design-tokens    Design variables (light/dark)
```

## Development

```bash
pnpm dev            # Start Web + API concurrently
pnpm build          # Full build
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm test           # Run tests
pnpm ci             # Full CI check (lint + format + typecheck + test + build)
```

## License

MIT
