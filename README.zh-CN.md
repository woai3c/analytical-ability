<div align="center">
  <img src="./public/logo.svg" alt="Clarity" width="96" />
  <h1 align="center">Clarity</h1>
  <p align="center">简体中文 / <a href="./README.md">English</a></p>
  <p align="center"><strong>AI 不替你思考，而是训练你如何思考。</strong></p>
  <p align="center">
    通过真实的 AI 场景训练，学习何时以及如何使用不同的分析方法，并获得即时反馈。
  </p>
  <p align="center">
    <a href="https://clarity-theta-eight.vercel.app/">在线体验</a>
    ·
    <a href="#主要功能">主要功能</a>
    ·
    <a href="#本地开发">开发</a>
  </p>
</div>

Clarity 是一个开源的分析思维训练工具。它不仅介绍 5 Why、鱼骨图、SWOT、MCDA 等分析方法，还通过真实场景帮助你学习如何选择方法、组织信息并完成结构化分析。

Clarity 不会直接替你给出答案，而是提供场景、引导分析过程，并针对你的推理结果给出即时反馈。

## 为什么需要 Clarity？

分析方法在书里看起来很容易，但到了真实工作中，往往会遇到这些问题：

- 当前问题应该使用哪一种方法？
- 哪些信息真正重要？
- 你分析的是原因、现象、风险，还是不同方案之间的取舍？
- 最终结论是否真的有推理过程和证据支撑？

Clarity 将抽象的分析方法转换成可重复练习的训练流程，通过不同场景和针对性反馈，帮助你逐步形成结构化思考习惯。

## 主要功能

### 学习分析方法

- **方法库** — 内置 12 种分析方法，包含完整介绍、适用场景、操作步骤、动画演示和示例演练
- **方法选择** — 学习不同的问题、决策和调查任务分别适合使用什么方法
- **实际案例** — 通过具体场景理解分析框架，而不是只记忆抽象定义

### 使用 AI 进行场景训练

- **场景训练** — 练习由 AI 生成的真实工作与决策场景
- **引导式分析** — 选择方法、逐步运用、获得综合评审，而不是直接跳到答案
- **即时反馈** — 获得关于分析优点、缺失证据、薄弱假设和下一步方向的针对性反馈
- **内置提示** — 不知道如何继续时，可以逐步获得思路提示

### 追踪进度并掌控数据

- **进度追踪** — 按场景类型和分析方法查看练习历史与趋势变化
- **数据可控** — 练习数据保存在浏览器 `localStorage`，支持导出和导入
- **纯前端应用** — 无需后端和数据库，可部署到 Vercel、Netlify、GitHub Pages 等静态托管平台
- **自带 API Key** — AI 请求直接从浏览器发送到你配置的模型提供商

## 使用流程

```text
阅读真实场景
       ↓
选择分析方法并说明理由    ←（专项训练时跳过）
       ↓
运用方法分析并得出结论
       ↓
获得 AI 综合评审
```

## 快速开始

> Clarity 是纯前端应用，无需配置服务器或数据库。

### 本地开发

```bash
git clone https://github.com/woai3c/clarity.git
cd clarity
pnpm install
pnpm dev
```

打开 `http://localhost:5173`，然后进入**设置**页面配置 API Key。

### 部署

Clarity 是一个静态 SPA，可以部署到任意静态托管平台。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woai3c/clarity)

#### Vercel

1. 点击上方按钮，或者打开 Vercel 并导入本仓库。
2. 保持默认设置，Vercel 会自动识别 Vite。
3. 无需配置环境变量，直接点击 **Deploy**。
4. 部署完成后打开网站，在**设置**中配置 AI 提供商和 API Key。

#### 其他平台

```bash
pnpm build
```

生产文件会生成到 `dist/` 目录。将这个目录部署到 Netlify、GitHub Pages、Cloudflare Pages 或其他静态托管服务即可。

## 支持的 AI 提供商

| 提供商           | 默认模型          |
| ---------------- | ----------------- |
| DeepSeek         | deepseek-v4-flash |
| Anthropic        | claude-sonnet-5   |
| OpenAI           | gpt-5.6-sol       |
| Google Gemini    | gemini-3.5-flash  |
| xAI (Grok)       | grok-4.3          |
| 阿里（通义）     | qwen3.7-max       |
| 智谱（GLM）      | glm-5.2           |
| Moonshot（Kimi） | kimi-k3           |
| OpenAI 兼容      | 自定义            |

在**设置**页面选择提供商并填写 API Key。Key 只会保存在你的浏览器中。

## 技术栈

| 层级   | 技术                               |
| ------ | ---------------------------------- |
| 框架   | React 19 + Vite 8                  |
| 样式   | Tailwind CSS 4                     |
| AI     | Vercel AI SDK (`ai` + `@ai-sdk/*`) |
| 语言   | TypeScript                         |
| 包管理 | pnpm                               |

## 项目结构

```text
src/
  data/           数据契约、方法注册表和路由规则
  lib/            LLM 调用和 API 封装
  components/     UI 组件
  pages/          页面组件
  providers/      Context Provider
  styles/         明暗主题设计变量
public/           静态资源
index.html        入口 HTML
vite.config.ts    Vite 配置
```

## 开发命令

```bash
pnpm dev        # 启动开发服务
pnpm build      # 创建生产构建
pnpm lint       # 运行 ESLint
pnpm typecheck  # 运行 TypeScript 类型检查
pnpm test       # 运行测试
pnpm ci         # lint + format + typecheck + test + build
```

## FAQ

### 需要自己的 API Key 吗？

需要。Clarity 是纯前端应用，AI 请求会直接从浏览器发送到你配置的模型提供商。你需要从支持的提供商获取 API Key，并在**设置**页面中填写。

### 数据存储在哪里？

练习数据保存在浏览器的 `localStorage` 中。你可以将数据导出为 JSON 文件进行备份或迁移，也可以在之后重新导入。

### Clarity 可以离线使用吗？

应用加载完成后，方法库可以离线浏览。场景训练需要连接网络，因为它需要调用 AI 模型。

### Clarity 会让 AI 直接替我完成分析吗？

不会。Clarity 的目标是引导你的推理，而不是替代你的思考。分析过程和判断由你完成，AI 只负责生成场景、提供提示和反馈。

## License

[MIT](./LICENSE)
