import { describe, expect, it } from "vitest";
import type { GoalInput } from "@clarity/domain";
import { analyzeGoal, inferTaskType } from "../src/index.js";

const baseGoal: GoalInput = {
  rawGoal: "我想在六个月内转向 AI 产品经理岗位",
  currentState: "有三年 Web 开发经验，还没有产品项目经历",
  desiredOutcome: "获得至少一个 AI 产品经理录用通知",
  successMetric: "拿到一份满足薪资底线的书面 offer",
  deadline: "2027-01-31",
  constraints: ["每周最多投入 10 小时"],
  knownFacts: ["已经完成两个 AI API 小项目"],
  preferredTaskType: null,
};

describe("analysis engine", () => {
  it("routes learning and career-change goals", () => {
    expect(inferTaskType(baseGoal)).toBe("learning");
  });

  it("creates a traceable data and action plan", () => {
    const result = analyzeGoal(baseGoal);
    expect(result.completeness).toBe(100);
    expect(result.dataNeeds.some((item) => item.id === "skill-baseline")).toBe(true);
    expect(result.actionSteps.at(-1)?.kind).toBe("review");
  });

  it("does not hide missing success criteria", () => {
    const result = analyzeGoal({ ...baseGoal, successMetric: "" });
    expect(result.completeness).toBeLessThan(100);
    expect(result.clarifications.some((item) => item.field === "successMetric")).toBe(true);
  });

  it("returns a fully localized English analysis", () => {
    const result = analyzeGoal(
      {
        ...baseGoal,
        rawGoal: "Move into an AI product manager role within six months",
        currentState: "Three years of web development experience",
        desiredOutcome: "Receive one job offer",
      },
      "en",
    );
    expect(result.taskTypeLabel).toBe("Learn and develop");
    expect(result.dataNeeds[0]?.title).toBe("Current baseline");
    expect(result.actionSteps[0]?.doneWhen).toMatch(/recorded|confirmed/);
    expect(result.cautions.join(" ")).not.toMatch(/[\u3400-\u9fff]/);
  });
});
