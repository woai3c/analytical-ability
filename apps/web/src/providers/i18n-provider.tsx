import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "zh-CN" | "en";
type Variables = Record<string, string | number>;

const english: Record<string, string> = {
  "目标工作台": "Goal Workspace",
  "工作区": "Workspace",
  "目标分析": "Goal Analysis",
  "能力训练": "Analysis Training",
  "规则分析可离线运行；智能补充只提供语义建议，结论仍需证据验证。": "Rule-based analysis works without AI. Semantic suggestions still require evidence.",
  "主要导航": "Main navigation",
  "移动端导航": "Mobile navigation",
  "菜单": "Menu",
  "浅色": "Light",
  "深色": "Dark",
  "语言": "Language",
  "主题": "Theme",
  "新目标": "New goal",
  "目标草稿": "Goal draft",
  "已保存": "Saved",
  "从一个真实目标开始": "Start with a real goal",
  "新建目标": "New goal",
  "描述目标": "Describe",
  "补齐条件": "Clarify",
  "数据计划": "Data plan",
  "行动路线": "Action plan",
  "分析进度": "Analysis progress",
  "新建分析": "New analysis",
  "你现在最想完成的目标是什么？": "What goal matters most to you right now?",
  "先用自己的话描述。系统会区分事实、假设和未知项，告诉你还缺什么数据，而不是直接生成一篇看似正确的答案。": "Describe it in your own words. The system separates facts, assumptions, and unknowns, then identifies the data you still need instead of producing a plausible-looking answer.",
  "例如：我想在六个月内转向 AI 产品经理，但不知道需要补哪些能力、收集什么岗位数据，也不知道该从哪一步开始。": "Example: I want to move into an AI product manager role within six months, but I do not know which skills to build, what job data to collect, or where to begin.",
  "加载完整示例：": "Load an example:",
  "职业转型": "Career change",
  "改进产品": "Improve a product",
  "比较选择": "Compare options",
  "开始拆解": "Start analysis",
  "把愿望改成可分析的目标": "Turn an intention into an analyzable goal",
  "不知道的字段可以先留空；右侧会解释为什么需要它，而不会替你捏造。": "Leave unknown fields blank. The panel explains why they matter without inventing answers.",
  "原始目标": "Original goal",
  "必填": "Required",
  "当前起点": "Current state",
  "基线": "Baseline",
  "现在已经有什么、做到什么程度？": "What do you have now, and how far have you progressed?",
  "期望结果": "Desired outcome",
  "可观察结果": "Observable result",
  "完成后具体会发生什么？": "What observable result will exist when this is complete?",
  "成功标准": "Success criterion",
  "指标或证据": "Metric or evidence",
  "例如：连续四周达到 45%": "Example: remain at or above 45% for four weeks",
  "期限": "Deadline",
  "决定计划强度": "Sets planning intensity",
  "限制条件": "Constraints",
  "硬边界与偏好": "Hard limits and preferences",
  "例如：每周最多投入 10 小时": "Example: no more than 10 hours per week",
  "已知事实": "Known facts",
  "需要来源": "Source required",
  "例如：过去四周平均完成率为 28%": "Example: the four-week average completion rate is 28%",
  "任务类型": "Task type",
  "恢复自动判断": "Restore automatic inference",
  "添加": "Add",
  "可手动修正": "Can be corrected",
  "由系统判断": "Inferred by system",
  "继续到数据计划": "Continue to data plan",
  "返回": "Back",
  "先收集这些数据": "Collect this data first",
  "每一项都说明收集原因、字段和做法。必要数据不等于所有可能有用的数据。": "Each item explains why it matters, what fields to capture, and how to collect it. Necessary data is not the same as all potentially useful data.",
  "必要": "Required",
  "可选": "Optional",
  "需要填写": "Fields",
  "怎么做：": "Method: ",
  "修改条件": "Edit conditions",
  "查看行动路线": "View action plan",
  "从今天开始的行动路线": "An action plan starting today",
  "当前路线优先补齐高价值信息，再进行分析、行动和复盘。": "The plan fills high-value information gaps before analysis, action, and review.",
  "完成标准：": "Done when: ",
  "返回数据计划": "Back to data plan",
  "保存为执行项目": "Save as project",
  "分析状态": "Analysis status",
  "目标完整度": "Goal completeness",
  "输入目标后，这里会显示任务类型、缺口和风险。": "After you enter a goal, this panel shows its task type, gaps, and risks.",
  "智能补充": "Semantic suggestions",
  "规则负责稳定的流程骨架，智能补充只发现目标上下文中的隐含假设和检索词。": "Rules provide the stable workflow; semantic suggestions identify contextual assumptions and research terms.",
  "补充语义分析": "Generate suggestions",
  "正在分析": "Analyzing",
  "目标重述": "Goal restatement",
  "隐含假设": "Implicit assumptions",
  "建议下一步": "Suggested next step",
  "重新生成": "Regenerate",
  "智能补充暂时不可用，请稍后重试。": "Semantic suggestions are temporarily unavailable. Please try again later.",
  "待澄清问题": "Questions to clarify",
  "先回答前面的必要问题，后续结论会更可靠。": "Answer the required questions first to improve the reliability of later conclusions.",
  "分析边界": "Analysis limits",
  "轻量训练": "Short exercise",
  "用真实目标练分析，而不是背术语": "Practice analysis with real goals, not terminology",
  "每次目标分析会暴露一个具体能力缺口。训练中心据此生成 1—3 分钟练习，先让你判断，再给提示和反馈。": "Each goal analysis exposes a specific skill gap. Training turns it into a one-to-three-minute exercise: you decide first, then receive feedback.",
  "区分事实与假设": "Distinguish facts from assumptions",
  "约 1 分钟": "About 1 minute",
  "以下陈述属于哪一类？先独立判断，再查看解释。": "How should this statement be classified? Decide before reading the explanation.",
  "“只要我每周投入 10 小时，就一定能在六个月内成功转行。”": "“If I invest 10 hours every week, I will definitely change careers within six months.”",
  "事实": "Fact",
  "假设": "Assumption",
  "未知": "Unknown",
  "判断正确：这是假设": "Correct: this is an assumption",
  "再想一步：这是尚未验证的假设": "Think again: this is an untested assumption",
  "“每周 10 小时”是投入条件，“六个月内成功转行”是结果。两者是否足够，需要岗位要求、能力基线、历史基准率和实际试验来验证。": "“10 hours per week” is an input and “change careers within six months” is an outcome. Whether the input is sufficient requires job requirements, a skill baseline, historical base rates, and practical tests.",
  "本轮训练目标": "Training focus",
  "事实与假设": "Facts and assumptions",
  "正在练习": "In progress",
  "证据追溯": "Evidence traceability",
  "下一项": "Next",
  "反例意识": "Counterexample awareness",
  "待评估": "Not assessed",
  "与目标分析的连接": "Connection to goal analysis",
  "完成一次真实目标后，系统会从你修改最多、遗漏最多的环节生成下一道题，并把训练结果写回能力档案。": "After a real goal analysis, the system creates the next exercise from the areas you revised or missed most, then updates your skill profile.",
  "清空当前草稿并新建目标？": "Clear the current draft and create a new goal?",
  "添加{{label}}": "Add {{label}}",
  "删除{{value}}": "Remove {{value}}",
};

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Variables) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const storageKey = "analysis-language";

function getStoredLanguage(): Language {
  return localStorage.getItem(storageKey) === "en" ? "en" : "zh-CN";
}

function interpolate(text: string, variables?: Variables) {
  if (!variables) return text;
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        localStorage.setItem(storageKey, nextLanguage);
        setLanguageState(nextLanguage);
      },
      t(key, variables) {
        return interpolate(language === "en" ? english[key] ?? key : key, variables);
      },
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
