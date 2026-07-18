export const llmProviderIds = [
  "openai",
  "anthropic",
  "deepseek",
  "qwen",
  "kimi",
  "glm",
  "doubao",
  "ernie",
  "custom",
] as const;

export type LlmProviderId = (typeof llmProviderIds)[number];
type Protocol = "openai-responses" | "anthropic-messages" | "openai-chat";
type Environment = Record<string, string | undefined>;

export interface ProviderPreset {
  id: LlmProviderId;
  label: string;
  protocol: Protocol;
  keyEnv: string;
  baseUrlEnv: string;
  modelEnv: string;
  defaultBaseUrl: string;
  defaultModel: string;
  note: string;
}

export interface ProviderStatus {
  id: LlmProviderId;
  label: string;
  protocol: Protocol;
  configured: boolean;
  active: boolean;
  model: string;
  keyEnv: string;
  baseUrlEnv: string;
  modelEnv: string;
  note: string;
}

export interface ResolvedProviderConfig extends ProviderPreset {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
}

export interface StructuredGenerationInput {
  config: ResolvedProviderConfig;
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  schemaName: string;
}

export const providerPresets: readonly ProviderPreset[] = [
  {
    id: "openai",
    label: "OpenAI / ChatGPT",
    protocol: "openai-responses",
    keyEnv: "OPENAI_API_KEY",
    baseUrlEnv: "OPENAI_BASE_URL",
    modelEnv: "OPENAI_MODEL",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-5.6-sol",
    note: "使用 Responses API 与严格 JSON Schema。",
  },
  {
    id: "anthropic",
    label: "Anthropic / Claude",
    protocol: "anthropic-messages",
    keyEnv: "ANTHROPIC_API_KEY",
    baseUrlEnv: "ANTHROPIC_BASE_URL",
    modelEnv: "ANTHROPIC_MODEL",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultModel: "claude-sonnet-4-6",
    note: "使用原生 Messages API。",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    protocol: "openai-chat",
    keyEnv: "DEEPSEEK_API_KEY",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
    modelEnv: "DEEPSEEK_MODEL",
    defaultBaseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-v4-flash",
    note: "OpenAI Chat Completions 兼容接口。",
  },
  {
    id: "qwen",
    label: "阿里云百炼 / 通义千问",
    protocol: "openai-chat",
    keyEnv: "DASHSCOPE_API_KEY",
    baseUrlEnv: "QWEN_BASE_URL",
    modelEnv: "QWEN_MODEL",
    defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    note: "支持百炼 OpenAI 兼容地址，也可填写工作空间地址。",
  },
  {
    id: "kimi",
    label: "月之暗面 / Kimi",
    protocol: "openai-chat",
    keyEnv: "MOONSHOT_API_KEY",
    baseUrlEnv: "KIMI_BASE_URL",
    modelEnv: "KIMI_MODEL",
    defaultBaseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "",
    note: "模型名称更新较快，请填写控制台当前可用模型。",
  },
  {
    id: "glm",
    label: "智谱 / GLM",
    protocol: "openai-chat",
    keyEnv: "ZHIPU_API_KEY",
    baseUrlEnv: "GLM_BASE_URL",
    modelEnv: "GLM_MODEL",
    defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "",
    note: "请填写智谱控制台当前可用模型。",
  },
  {
    id: "doubao",
    label: "火山方舟 / 豆包",
    protocol: "openai-chat",
    keyEnv: "ARK_API_KEY",
    baseUrlEnv: "DOUBAO_BASE_URL",
    modelEnv: "DOUBAO_MODEL",
    defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    defaultModel: "",
    note: "DOUBAO_MODEL 通常填写方舟推理接入点 ID。",
  },
  {
    id: "ernie",
    label: "百度千帆 / 文心",
    protocol: "openai-chat",
    keyEnv: "QIANFAN_API_KEY",
    baseUrlEnv: "ERNIE_BASE_URL",
    modelEnv: "ERNIE_MODEL",
    defaultBaseUrl: "https://qianfan.baidubce.com/v2",
    defaultModel: "",
    note: "使用千帆 V2 Bearer Token 与 OpenAI 兼容接口。",
  },
  {
    id: "custom",
    label: "自定义兼容服务",
    protocol: "openai-chat",
    keyEnv: "CUSTOM_LLM_API_KEY",
    baseUrlEnv: "CUSTOM_LLM_BASE_URL",
    modelEnv: "CUSTOM_LLM_MODEL",
    defaultBaseUrl: "",
    defaultModel: "",
    note: "适用于 OneAPI、LiteLLM、本地网关等 OpenAI 兼容服务。",
  },
] as const;

function providerById(id: string | undefined): ProviderPreset {
  return providerPresets.find((provider) => provider.id === id) ?? providerPresets[0]!;
}

function value(env: Environment, key: string, fallback = "") {
  return env[key]?.trim() || fallback;
}

export function listProviderStatuses(env: Environment): ProviderStatus[] {
  const activeId = providerById(env.LLM_PROVIDER).id;
  return providerPresets.map((provider) => {
    const model = value(env, provider.modelEnv, provider.defaultModel);
    const baseUrl = value(env, provider.baseUrlEnv, provider.defaultBaseUrl);
    return {
      id: provider.id,
      label: provider.label,
      protocol: provider.protocol,
      configured: Boolean(value(env, provider.keyEnv) && model && baseUrl),
      active: provider.id === activeId,
      model,
      keyEnv: provider.keyEnv,
      baseUrlEnv: provider.baseUrlEnv,
      modelEnv: provider.modelEnv,
      note: provider.note,
    };
  });
}

export function resolveActiveProvider(env: Environment): ResolvedProviderConfig {
  const preset = providerById(env.LLM_PROVIDER);
  const apiKey = value(env, preset.keyEnv);
  const baseUrl = value(env, preset.baseUrlEnv, preset.defaultBaseUrl);
  const model = value(env, preset.modelEnv, preset.defaultModel);
  if (!apiKey || !baseUrl || !model) {
    throw new LlmError(
      "LLM_NOT_CONFIGURED",
      `${preset.label} 尚未配置完整，请检查 ${preset.keyEnv}、${preset.baseUrlEnv} 和 ${preset.modelEnv}。`,
      503,
    );
  }
  return {
    ...preset,
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
    timeoutMs: Number(env.LLM_TIMEOUT_MS ?? 90_000),
    maxOutputTokens: Number(env.LLM_MAX_OUTPUT_TOKENS ?? 4_000),
  };
}

export class LlmError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function postJson(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      const nested = body.error as { message?: string } | undefined;
      throw new LlmError("LLM_UPSTREAM_ERROR", nested?.message ?? `模型服务返回 HTTP ${response.status}`, 502);
    }
    return body;
  } catch (error) {
    if (error instanceof LlmError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new LlmError("LLM_TIMEOUT", `模型请求超过 ${timeoutMs}ms。`, 504);
    }
    throw new LlmError("LLM_NETWORK_ERROR", error instanceof Error ? error.message : "模型网络请求失败。", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseJsonText(text: string): unknown {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(clean);
  } catch {
    throw new LlmError("LLM_INVALID_JSON", "模型没有返回有效 JSON，请重试或更换模型。", 502);
  }
}

async function generateWithOpenAI(input: StructuredGenerationInput) {
  const body = await postJson(
    endpoint(input.config.baseUrl, "responses"),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${input.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.config.model,
        instructions: input.system,
        input: input.prompt,
        max_output_tokens: input.config.maxOutputTokens,
        text: {
          format: {
            type: "json_schema",
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        },
      }),
    },
    input.config.timeoutMs,
  );
  const output = body.output as Array<{ content?: Array<{ type?: string; text?: string }> }> | undefined;
  const text = output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new LlmError("LLM_EMPTY_RESPONSE", "OpenAI 没有返回文本结果。", 502);
  return parseJsonText(text);
}

async function generateWithAnthropic(input: StructuredGenerationInput) {
  const schemaPrompt = `${input.prompt}\n\n请只返回符合以下 JSON Schema 的 JSON，不要使用 Markdown 代码块：\n${JSON.stringify(input.schema)}`;
  const body = await postJson(
    endpoint(input.config.baseUrl, "v1/messages"),
    {
      method: "POST",
      headers: {
        "x-api-key": input.config.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.config.model,
        system: input.system,
        messages: [{ role: "user", content: schemaPrompt }],
        max_tokens: input.config.maxOutputTokens,
      }),
    },
    input.config.timeoutMs,
  );
  const content = body.content as Array<{ type?: string; text?: string }> | undefined;
  const text = content?.find((item) => item.type === "text")?.text;
  if (!text) throw new LlmError("LLM_EMPTY_RESPONSE", "Claude 没有返回文本结果。", 502);
  return parseJsonText(text);
}

async function generateWithOpenAIChat(input: StructuredGenerationInput) {
  const schemaPrompt = `${input.prompt}\n\n请只返回符合以下 JSON Schema 的 JSON，不要使用 Markdown 代码块：\n${JSON.stringify(input.schema)}`;
  const body = await postJson(
    endpoint(input.config.baseUrl, "chat/completions"),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${input.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.config.model,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: schemaPrompt },
        ],
        max_tokens: input.config.maxOutputTokens,
        stream: false,
      }),
    },
    input.config.timeoutMs,
  );
  const choices = body.choices as Array<{ message?: { content?: string } }> | undefined;
  const text = choices?.[0]?.message?.content;
  if (!text) throw new LlmError("LLM_EMPTY_RESPONSE", "模型没有返回文本结果。", 502);
  return parseJsonText(text);
}

export async function generateStructured(input: StructuredGenerationInput): Promise<unknown> {
  if (input.config.protocol === "openai-responses") return generateWithOpenAI(input);
  if (input.config.protocol === "anthropic-messages") return generateWithAnthropic(input);
  return generateWithOpenAIChat(input);
}
