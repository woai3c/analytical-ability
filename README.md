# Clarity — 分析方法训练平台

学会分析方法，自己做分析。

Clarity 不替你分析——它教你**怎么分析**。通过场景训练掌握鱼骨图、5 Why、MCDA 等分析方法，在真实问题中学会选择和运用正确的工具。

[English](./README.en.md)

## 功能

- **方法库** — 12 种分析方法，每种包含完整介绍、操作步骤和具体示例
- **场景训练** — AI 生成真实场景，你判断该用什么方法并写出思路，获得即时反馈
- **进度追踪** — 记录练习历史，按场景类型和方法维度查看掌握情况

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量（至少填一个 API Key）
cp .env.example .env

# 启动开发服务
pnpm dev
```

默认地址：

- Web: `http://localhost:5173`
- API: `http://localhost:8787`

## 接入大模型

编辑 `.env`，填写任一模型提供商的 API Key 即可使用：

```dotenv
DEEPSEEK_API_KEY=your-key-here
```

支持的提供商：DeepSeek、Anthropic、OpenAI、Google Gemini、xAI、Qwen、Zhipu、Moonshot，以及任意 OpenAI 兼容服务。

系统自动按优先级选择已配置的提供商，无需手动指定模型。

## 技术栈

| 层     | 技术                        |
| ------ | --------------------------- |
| 前端   | React + Vite + Tailwind CSS |
| 后端   | Fastify + Vercel AI SDK     |
| 语言   | TypeScript (monorepo)       |
| 包管理 | pnpm workspaces             |

## 目录结构

```
apps/web                  React Web 应用
apps/api                  Fastify API 服务
packages/domain           数据契约与类型定义
packages/analysis-engine  分析方法注册表与规则
packages/llm              多模型服务适配层
packages/design-tokens    设计变量（Light/Dark）
```

## 开发命令

```bash
pnpm dev            # 同时启动 Web + API
pnpm build          # 全量构建
pnpm lint           # ESLint 检查
pnpm format         # Prettier 格式化
pnpm test           # 运行测试
pnpm ci             # 完整 CI 检查（lint + format + typecheck + test + build）
```

## License

MIT
