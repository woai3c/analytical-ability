# 目标分析产品

当前仓库包含响应式 Web 应用、API 和可复用的分析领域包。产品名称尚未最终确定，因此代码使用中性的内部包名。

## 本地开发

```bash
pnpm install
Copy-Item .env.example .env
pnpm dev
```

- Web：以 Vite 输出的 `Local` 地址为准；默认是 `http://localhost:5173`，端口被占用时会自动使用下一个可用端口。
- API：`http://localhost:8787`

## 接入大模型

编辑根目录 `.env`：

```dotenv
LLM_PROVIDER=openai
OPENAI_API_KEY=你的密钥
OPENAI_MODEL=gpt-5.6-sol
```

也可以把 `LLM_PROVIDER` 改为 `anthropic`、`deepseek`、`qwen`、`kimi`、`glm`、`doubao`、`ernie` 或 `custom`，并填写 `.env.example` 中对应的一组变量。修改后需重启 API。

- 所有密钥只由 `apps/api` 在服务端读取，不能加 `VITE_` 前缀。
- Web 端只读取 `VITE_API_BASE_URL`，不会接触或回传模型密钥。
- 模型配置属于管理员部署配置，用户端不显示供应商、模型名称、密钥状态或连接测试入口。
- 目标分析先运行确定性规则，再由当前模型按需补充语义分析；未配置模型时核心流程仍可用。

## 语言与主题

- 用户界面支持简体中文和英文，首次访问默认简体中文。
- 主题只支持 Light 和 Dark，首次访问默认 Light，不跟随操作系统。
- 语言与主题选择保存在当前浏览器中。

## 代码质量

```bash
pnpm lint          # ESLint 检查
pnpm lint:fix      # 自动修复可修复的 ESLint 问题
pnpm format        # Prettier 格式化
pnpm format:check  # 检查格式但不修改文件
pnpm run ci        # lint、格式、类型、测试和构建的完整本地检查
```

- VS Code 默认在保存时运行 Prettier，并显式提供 ESLint 修复和删除未使用导入操作。
- 提交前由 Husky 和 lint-staged 检查暂存文件。
- 提交信息采用英文 Conventional Commits，例如 `feat: add goal evidence tracking`。
- Pull Request 和 `main` 分支推送会触发 GitHub Actions；CI 只检查，不自动改写或推送代码。

## 目录

```text
apps/web                  React + Vite Web/PWA
apps/api                  Fastify API
packages/domain           目标与分析结果的数据契约
packages/analysis-engine  确定性目标分析规则
packages/llm              多模型服务适配层
packages/design-tokens    Light/Dark 语义设计变量
```
