<div align="center">

<h1>Clarity</h1>

学分析方法，自己做分析。

[English](./README.en.md) · [在线体验](https://analytical-ability-web.vercel.app/) · [快速开始](#get-started)

</div>

## 这是什么

Clarity 不替你分析——它教你**怎么分析**。

通过场景训练掌握鱼骨图、5 Why、MCDA 等 12 种分析方法。AI 生成真实场景让你判断该用什么方法，提交后获得即时反馈。所有数据存储在浏览器本地，带上自己的 API Key 即可使用。

## 主要功能

- **方法库** — 12 种分析方法，每种包含完整介绍、操作步骤、输入输出和示例演练
- **场景训练** — AI 生成真实决策场景，5 步引导式分析训练，获得针对性反馈
- **进度追踪** — 记录练习历史，按场景类型和方法维度查看掌握情况
- **纯前端** — 无需后端服务，Vercel / Netlify / GitHub Pages 一键部署
- **数据可控** — 练习数据存储在浏览器 localStorage，支持导出 / 导入迁移

## 快速开始 <a id="get-started"></a>

> 纯前端应用，无需配置服务器或数据库。

### 本地开发

```bash
git clone https://github.com/woai3c/analytical-ability.git
cd analytical-ability
pnpm install
pnpm dev
```

打开 `http://localhost:5173`，进入**设置**页面配置 API Key 即可使用。

### 部署 <a id="deploy"></a>

Clarity 是纯静态 SPA，可部署到任何静态托管平台：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woai3c/analytical-ability)

#### Vercel 部署步骤

1. 点击上方按钮或进入 [vercel.com/new](https://vercel.com/new)，Import 本仓库
2. 保持默认配置即可（Framework Preset 会自动识别为 Vite）
3. 无需设置任何环境变量，点击 **Deploy**
4. 部署完成后打开网站，进入「设置」页面配置你自己的 AI API Key

#### 其他平台

```bash
pnpm build     # 输出到 dist/
```

将 `dist` 目录部署到 Netlify / GitHub Pages / Cloudflare Pages 等静态托管平台即可。

## 支持的 AI 提供商

| 提供商          | 默认模型          |
| --------------- | ----------------- |
| DeepSeek        | deepseek-v4-flash |
| Anthropic       | claude-sonnet-5   |
| OpenAI          | gpt-5.6-sol       |
| Google Gemini   | gemini-3.5-flash  |
| xAI (Grok)      | grok-4.3          |
| 阿里 (通义)     | qwen3.7-max       |
| 智谱 (GLM)      | glm-5.2           |
| Moonshot (Kimi) | kimi-k3           |
| OpenAI 兼容     | 自定义            |

在设置页面选择提供商、填入 API Key 即完成配置。Key 仅保存在你的浏览器中。

## 技术栈

| 层     | 技术                               |
| ------ | ---------------------------------- |
| 框架   | React 19 + Vite 8                  |
| 样式   | Tailwind CSS 4                     |
| AI     | Vercel AI SDK (`ai` + `@ai-sdk/*`) |
| 语言   | TypeScript                         |
| 包管理 | pnpm                               |

## 项目结构

```
src/
  data/           数据契约、方法注册表与路由规则
  lib/            LLM 调用、API 封装
  components/     UI 组件
  pages/          页面组件
  providers/      Context Provider
  styles/         设计变量（Light / Dark）
public/           静态资源
index.html        入口 HTML
vite.config.ts    Vite 配置
```

## 开发命令

```bash
pnpm dev        # 启动开发服务
pnpm build      # 生产构建
pnpm lint       # ESLint
pnpm typecheck  # TypeScript 类型检查
pnpm test       # 测试
pnpm ci         # lint + format + typecheck + test + build
```

## FAQ

**Q: 需要自己的 API Key 吗？**

是的。Clarity 是纯前端应用，AI 调用直接从你的浏览器发出。你需要从 DeepSeek / OpenAI / Google 等提供商获取 API Key，在设置页面配置。

**Q: 数据存储在哪里？**

所有练习数据存储在浏览器的 localStorage 中。可以在设置页面导出为 JSON 文件进行备份或迁移。

**Q: 可以离线使用吗？**

方法库页面可以离线浏览。场景训练需要网络连接来调用 AI 模型。

## License

[MIT](./LICENSE)
