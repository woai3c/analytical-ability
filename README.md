<div align="center">
  <img src="./public/logo.svg" alt="Clarity" width="96" />
  <h1 align="center">Clarity</h1>
  <p align="center">English / <a href="./README.zh-CN.md">简体中文</a></p>
  <p align="center"><strong>AI doesn't think for you. It trains you to think.</strong></p>
  <p align="center">
    Learn when and how to apply analytical methods through realistic AI-generated scenarios and immediate feedback.
  </p>
  <p align="center">
    <a href="https://clarity-theta-eight.vercel.app/">Live Demo</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#local-development">Development</a>
  </p>
</div>

Clarity is an open-source analytical thinking trainer. It helps you move beyond memorizing frameworks and learn how to choose and apply methods such as 5 Whys, Fishbone Diagram, SWOT, and MCDA in realistic situations.

Instead of asking AI to solve the problem for you, Clarity gives you a scenario, guides you through the reasoning process, and provides immediate feedback on your analysis.

## Why Clarity?

Analytical methods are easy to recognize in a book but much harder to use in real work:

- Which method should you choose?
- What information matters?
- Are you identifying causes, symptoms, risks, or trade-offs?
- Is your conclusion actually supported by your reasoning?

Clarity turns analytical methods into guided practice, helping you build the habit of structured thinking through repeated scenarios and targeted feedback.

## Features

### Learn analytical methods

- **Method Library** — 12 analytical methods with introductions, use cases, step-by-step guides, animated walkthroughs, and worked examples
- **Method Selection** — Learn which method fits different types of problems, decisions, and investigations
- **Practical Examples** — Understand each framework through concrete scenarios instead of abstract definitions

### Practice with AI

- **Scenario Training** — Practice with realistic AI-generated scenarios across different domains
- **Guided Analysis** — Choose a method, apply it step by step, and receive a comprehensive review
- **Immediate Feedback** — Receive targeted feedback on strengths, missing evidence, weak assumptions, and possible next steps
- **Built-in Hints** — Get progressive guidance when you are unsure how to continue

### Track and own your progress

- **Progress Tracking** — Review practice history by scenario type and analytical method, with trend comparison
- **Data Ownership** — Practice data is stored in browser `localStorage` and can be exported or imported
- **Pure Frontend** — No backend or database is required; deploy to Vercel, Netlify, GitHub Pages, or any static hosting platform
- **Bring Your Own API Key** — AI requests are sent directly from your browser to the provider you configure

## How It Works

```text
Read a realistic scenario
        ↓
Select an analysis method and explain why    ← (skipped in focused training)
        ↓
Apply the method and draw conclusions
        ↓
Receive a comprehensive AI review
```

## Get Started

> Clarity is a pure frontend application. No server or database is required.

### Local Development

```bash
git clone https://github.com/woai3c/clarity.git
cd clarity
pnpm install
pnpm dev
```

Open `http://localhost:5173`, then go to **Settings** and configure your API Key.

### Deploy

Clarity is a static SPA and can be deployed to any static hosting platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woai3c/clarity)

#### Vercel

1. Click the button above, or open Vercel and import this repository.
2. Keep the default settings. Vercel will detect Vite automatically.
3. No environment variables are required. Click **Deploy**.
4. Open the deployed site and configure your AI provider and API Key in **Settings**.

#### Other Platforms

```bash
pnpm build
```

The production files are generated in `dist/`. Deploy that directory to Netlify, GitHub Pages, Cloudflare Pages, or another static hosting service.

## Supported AI Providers

| Provider          | Default Model     |
| ----------------- | ----------------- |
| DeepSeek          | deepseek-v4-flash |
| Anthropic         | claude-sonnet-5   |
| OpenAI            | gpt-5.6-sol       |
| Google Gemini     | gemini-3.5-flash  |
| xAI (Grok)        | grok-4.3          |
| Alibaba (Qwen)    | qwen3.7-max       |
| Zhipu (GLM)       | glm-5.2           |
| Moonshot (Kimi)   | kimi-k3           |
| OpenAI Compatible | Custom            |

Select a provider and enter your API Key in **Settings**. Your key is stored only in your browser.

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | React 19 + Vite 8                  |
| Styling         | Tailwind CSS 4                     |
| AI              | Vercel AI SDK (`ai` + `@ai-sdk/*`) |
| Language        | TypeScript                         |
| Package Manager | pnpm                               |

## Project Structure

```text
src/
  data/           Data contracts, method registry, and routing rules
  lib/            LLM calls and API wrappers
  components/     UI components
  pages/          Page components
  providers/      Context providers
  styles/         Theme variables for light and dark modes
public/           Static assets
index.html        Entry HTML
vite.config.ts    Vite configuration
```

## Development

```bash
pnpm dev        # Start the development server
pnpm build      # Create a production build
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript type checking
pnpm test       # Run tests
pnpm ci         # lint + format + typecheck + test + build
```

## FAQ

### Do I need my own API Key?

Yes. Clarity is a pure frontend application, so AI requests are sent directly from your browser to the provider you configure. Obtain an API Key from a supported provider and enter it in **Settings**.

### Where is my data stored?

Practice data is stored in your browser's `localStorage`. You can export it as a JSON file for backup or migration and import it again later.

### Can I use Clarity offline?

The Method Library can be viewed offline after the application has loaded. Scenario Training requires a network connection because it calls an AI provider.

### Does Clarity let AI do the analysis for me?

No. Clarity is designed to guide your reasoning, not replace it. You make the analytical decisions, and AI provides scenarios, hints, and feedback.

## License

[MIT](./LICENSE)
