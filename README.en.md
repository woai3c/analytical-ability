<div align="center">

<h1>Clarity</h1>

Learn analysis methods. Do the analysis yourself.

[中文](./README.md) · [Get Started](#get-started) · [Deploy](#deploy)

</div>

## What is this

Clarity doesn't analyze for you — it teaches you **how to analyze**.

Practice 12 analysis methods (Fishbone, 5 Why, MCDA, etc.) through scenario-based training. AI generates realistic scenarios where you decide which method to apply, then gives you immediate feedback. All data stays in your browser. Bring your own API key.

## Features

- **Method Library** — 12 analysis methods with full introductions, step-by-step guides, and worked examples
- **Scenario Training** — AI-generated real-world scenarios; pick the right method, explain your reasoning, get feedback
- **Progress Tracking** — Practice history organized by scenario type and method
- **Pure Frontend** — No backend required; deploy to Vercel / Netlify / GitHub Pages
- **Data Ownership** — Practice data stored in browser localStorage with export / import

## Get Started <a id="get-started"></a>

> Pure frontend app. No server or database to configure.

### Local Development

```bash
git clone https://github.com/[your-username]/analytical-ability.git
cd analytical-ability
pnpm install
pnpm dev
```

Open `http://localhost:5173`, go to **Settings** and configure your API Key.

### Deploy <a id="deploy"></a>

Clarity is a static SPA deployable to any hosting platform:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-username]/analytical-ability)

```bash
pnpm build     # Output: apps/web/dist
```

No server-side environment variables needed — users configure their own API Key in the Settings page.

## Supported AI Providers

| Provider          | Default Model    |
| ----------------- | ---------------- |
| DeepSeek          | deepseek-chat    |
| OpenAI            | gpt-4o           |
| Google Gemini     | gemini-2.5-flash |
| xAI (Grok)        | grok-3           |
| Moonshot (Kimi)   | moonshot-v1-128k |
| OpenAI Compatible | Custom           |

Select a provider and enter your API Key in the Settings page. Keys are stored only in your browser.

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | React 19 + Vite                    |
| Styling         | Tailwind CSS 4                     |
| AI              | Vercel AI SDK (`ai` + `@ai-sdk/*`) |
| Language        | TypeScript (monorepo)              |
| Package Manager | pnpm workspaces                    |

## Project Structure

```
apps/web                  React SPA
packages/domain           Data contracts & types
packages/analysis-engine  Method registry & rules
packages/design-tokens    Theme variables (Light / Dark)
```

## Development

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
pnpm test       # Run tests
pnpm ci         # lint + format + typecheck + test + build
```

## FAQ

**Q: Do I need my own API Key?**

Yes. Clarity is a pure frontend app — AI calls go directly from your browser. Get an API Key from DeepSeek / OpenAI / Google and configure it in Settings.

**Q: Where is my data stored?**

All practice data is stored in your browser's localStorage. You can export it as a JSON file for backup or migration in Settings.

**Q: Can I use it offline?**

The Method Library pages work offline. Scenario Training requires a network connection to call AI models.

## License

[MIT](./LICENSE)
