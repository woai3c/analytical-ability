import { describe, expect, it } from "vitest";
import { listProviderStatuses, parseJsonText, resolveActiveProvider } from "../src/index.js";

describe("LLM provider configuration", () => {
  it("never exposes the API key in provider status", () => {
    const statuses = listProviderStatuses({ LLM_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "secret" });
    expect(statuses.find((item) => item.id === "deepseek")).toMatchObject({ configured: true, active: true });
    expect(JSON.stringify(statuses)).not.toContain("secret");
  });

  it("requires a model for providers without a stable default", () => {
    expect(() => resolveActiveProvider({ LLM_PROVIDER: "kimi", MOONSHOT_API_KEY: "secret" })).toThrow();
  });

  it("parses JSON with or without a markdown fence", () => {
    expect(parseJsonText('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });
});
