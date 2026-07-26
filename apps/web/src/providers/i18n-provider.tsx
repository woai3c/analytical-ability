import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'zh-CN' | 'en'
type Variables = Record<string, string | number>

const english: Record<string, string> = {
  目标工作台: 'Goal Workspace',
  工作区: 'Workspace',
  目标分析: 'Goal Analysis',
  能力训练: 'Analysis Training',
  '规则分析可离线运行；智能补充只提供语义建议，结论仍需证据验证。':
    'Rule-based analysis works without AI. Semantic suggestions still require evidence.',
  主要导航: 'Main navigation',
  移动端导航: 'Mobile navigation',
  菜单: 'Menu',
  浅色: 'Light',
  深色: 'Dark',
  语言: 'Language',
  主题: 'Theme',
  切换到浅色主题: 'Switch to light theme',
  切换到深色主题: 'Switch to dark theme',
  切换到英文: 'Switch to English',
  切换到中文: 'Switch to Chinese',
  新目标: 'New goal',
  目标草稿: 'Goal draft',
  已保存: 'Saved',
  从一个真实目标开始: 'Start with a real goal',
  新建目标: 'New goal',
  描述目标: 'Describe',
  补齐条件: 'Clarify',
  数据计划: 'Data plan',
  行动路线: 'Action plan',
  分析进度: 'Analysis progress',
  新建分析: 'New analysis',
  '你现在最想完成的目标是什么？': 'What goal matters most to you right now?',
  '先用自己的话描述。系统会区分事实、假设和未知项，告诉你还缺什么数据，而不是直接生成一篇看似正确的答案。':
    'Describe it in your own words. The system separates facts, assumptions, and unknowns, then identifies the data you still need instead of producing a plausible-looking answer.',
  '例如：我想在六个月内转向 AI 产品经理，但不知道需要补哪些能力、收集什么岗位数据，也不知道该从哪一步开始。':
    'Example: I want to move into an AI product manager role within six months, but I do not know which skills to build, what job data to collect, or where to begin.',
  '加载完整示例：': 'Load an example:',
  职业转型: 'Career change',
  改进产品: 'Improve a product',
  比较选择: 'Compare options',
  开始拆解: 'Start analysis',
  把愿望改成可分析的目标: 'Turn an intention into an analyzable goal',
  '不知道的字段可以先留空；右侧会解释为什么需要它，而不会替你捏造。':
    'Leave unknown fields blank. The panel explains why they matter without inventing answers.',
  原始目标: 'Original goal',
  必填: 'Required',
  当前起点: 'Current state',
  基线: 'Baseline',
  '现在已经有什么、做到什么程度？': 'What do you have now, and how far have you progressed?',
  期望结果: 'Desired outcome',
  可观察结果: 'Observable result',
  '完成后具体会发生什么？': 'What observable result will exist when this is complete?',
  成功标准: 'Success criterion',
  指标或证据: 'Metric or evidence',
  '例如：连续四周达到 45%': 'Example: remain at or above 45% for four weeks',
  期限: 'Deadline',
  决定计划强度: 'Sets planning intensity',
  限制条件: 'Constraints',
  硬边界与偏好: 'Hard limits and preferences',
  '例如：每周最多投入 10 小时': 'Example: no more than 10 hours per week',
  已知事实: 'Known facts',
  需要来源: 'Source required',
  '例如：过去四周平均完成率为 28%': 'Example: the four-week average completion rate is 28%',
  任务类型: 'Task type',
  恢复自动判断: 'Restore automatic inference',
  添加: 'Add',
  可手动修正: 'Can be corrected',
  由系统判断: 'Inferred by system',
  继续到数据计划: 'Continue to data plan',
  返回: 'Back',
  先收集这些数据: 'Collect this data first',
  '每一项都说明收集原因、字段和做法。必要数据不等于所有可能有用的数据。':
    'Each item explains why it matters, what fields to capture, and how to collect it. Necessary data is not the same as all potentially useful data.',
  必要: 'Required',
  可选: 'Optional',
  需要填写: 'Fields',
  '怎么做：': 'Method: ',
  修改条件: 'Edit conditions',
  查看行动路线: 'View action plan',
  从今天开始的行动路线: 'An action plan starting today',
  '当前路线优先补齐高价值信息，再进行分析、行动和复盘。':
    'The plan fills high-value information gaps before analysis, action, and review.',
  '完成标准：': 'Done when: ',
  返回数据计划: 'Back to data plan',
  保存为执行项目: 'Save as project',
  分析状态: 'Analysis status',
  目标完整度: 'Goal completeness',
  '输入目标后，这里会显示任务类型、缺口和风险。':
    'After you enter a goal, this panel shows its task type, gaps, and risks.',
  智能补充: 'Semantic suggestions',
  '规则负责稳定的流程骨架，智能补充只发现目标上下文中的隐含假设和检索词。':
    'Rules provide the stable workflow; semantic suggestions identify contextual assumptions and research terms.',
  补充语义分析: 'Generate suggestions',
  正在分析: 'Analyzing',
  目标重述: 'Goal restatement',
  隐含假设: 'Implicit assumptions',
  建议下一步: 'Suggested next step',
  重新生成: 'Regenerate',
  '智能补充暂时不可用，请稍后重试。': 'Semantic suggestions are temporarily unavailable. Please try again later.',
  待澄清问题: 'Questions to clarify',
  '先回答前面的必要问题，后续结论会更可靠。':
    'Answer the required questions first to improve the reliability of later conclusions.',
  分析边界: 'Analysis limits',
  轻量训练: 'Short exercise',
  '用真实目标练分析，而不是背术语': 'Practice analysis with real goals, not terminology',
  '每次目标分析会暴露一个具体能力缺口。训练中心据此生成 1—3 分钟练习，先让你判断，再给提示和反馈。':
    'Each goal analysis exposes a specific skill gap. Training turns it into a one-to-three-minute exercise: you decide first, then receive feedback.',
  区分事实与假设: 'Distinguish facts from assumptions',
  '约 1 分钟': 'About 1 minute',
  '以下陈述属于哪一类？先独立判断，再查看解释。':
    'How should this statement be classified? Decide before reading the explanation.',
  '“只要我每周投入 10 小时，就一定能在六个月内成功转行。”':
    '“If I invest 10 hours every week, I will definitely change careers within six months.”',
  事实: 'Fact',
  假设: 'Assumption',
  未知: 'Unknown',
  '判断正确：这是假设': 'Correct: this is an assumption',
  '再想一步：这是尚未验证的假设': 'Think again: this is an untested assumption',
  '“每周 10 小时”是投入条件，“六个月内成功转行”是结果。两者是否足够，需要岗位要求、能力基线、历史基准率和实际试验来验证。':
    '“10 hours per week” is an input and “change careers within six months” is an outcome. Whether the input is sufficient requires job requirements, a skill baseline, historical base rates, and practical tests.',
  本轮训练目标: 'Training focus',
  事实与假设: 'Facts and assumptions',
  正在练习: 'In progress',
  证据追溯: 'Evidence traceability',
  下一项: 'Next',
  反例意识: 'Counterexample awareness',
  待评估: 'Not assessed',
  与目标分析的连接: 'Connection to goal analysis',
  '完成一次真实目标后，系统会从你修改最多、遗漏最多的环节生成下一道题，并把训练结果写回能力档案。':
    'After a real goal analysis, the system creates the next exercise from the areas you revised or missed most, then updates your skill profile.',
  '清空当前草稿并新建目标？': 'Clear the current draft and create a new goal?',
  '添加{{label}}': 'Add {{label}}',
  '删除{{value}}': 'Remove {{value}}',
  取消: 'Cancel',
  确认清空: 'Clear draft',
  使用此示例: 'Use this example',
  '将用示例内容替换当前草稿。': 'This will replace your current draft with the example.',
  '载入示例，看看一份可分析的目标长什么样。': 'Load an example to see what an analyzable goal looks like.',
  选择日期: 'Select a date',
  '请先填写原始目标（至少 4 个字）': 'Please describe your goal first (at least 4 characters).',

  // ── LLM 向导（v2）──
  分析计划: 'Analysis plan',
  分析执行: 'Run analysis',
  已保存的执行项目: 'Saved projects',
  '第 {{step}} 步': 'Step {{step}}',
  继续: 'Resume',
  确认删除: 'Confirm delete',
  删除项目: 'Delete project',
  '试试这些目标：': 'Try one of these:',
  '用自己的话描述就行。AI 会立即分析你的目标，判断该用哪些分析方法，并告诉你为了开始分析还需要补充什么——而不是甩给你一张看不懂的固定表单。':
    'Describe it in your own words. The AI immediately analyzes your goal, picks suitable analysis methods, and tells you exactly what to fill in next — instead of dropping a cryptic fixed form on you.',
  '检查网络和后端配置后可以重试；也可以先': 'Check the network and API configuration, then retry — or',
  '使用离线规则模式（不调用 AI）': 'use the offline rule-based mode (no AI)',
  'AI 正在分析你的目标…': 'The AI is analyzing your goal…',
  开始分析: 'Start analysis',
  '请求失败，请重试。': 'Request failed. Please try again.',
  未命名目标: 'Untitled goal',

  // step 2
  'AI 对你目标的理解': 'How the AI understands your goal',
  已经从你的描述里提取到: 'Already extracted from your description',
  '你描述里的隐含假设（需要验证，不是事实）': 'Implicit assumptions in your description (to be verified, not facts)',
  '任务类型（判断错了可以改）': 'Task type (correct it if wrong)',
  '开始分析前，还需要你补充这些条件': 'Before the analysis can run, please fill in these conditions',
  '条件已经足够，可以直接进入分析计划': 'Enough information — you can go straight to the analysis plan',
  '这些问题是 AI 根据你的目标和要用到的分析方法动态生成的，每张卡片都标了哪个方法需要它。':
    'These questions are generated by the AI for your specific goal and the analysis methods it will use; each card shows which method needs it.',
  再检查一遍还缺什么: 'Check again what is missing',
  '正在重新检查…': 'Re-checking…',
  必须补充: 'Required',
  建议补充: 'Recommended',
  已回答: 'Answered',
  '为什么需要：': 'Why it is needed: ',
  '可以参考这些填法（点击填入）：': 'Example answers for THIS goal (click to fill):',
  '还有 {{count}} 个必答问题未填，对应的方法将无法运行':
    '{{count}} required questions unanswered; the related methods cannot run',
  '正在生成分析计划…': 'Building the analysis plan…',
  生成分析计划: 'Build analysis plan',

  // step 3
  将用这些方法为你分析: 'These methods will analyze your goal',
  '方法由规则引擎根据任务类型路由，AI 解释推荐理由。你可以移出或加回方法；标注"还缺输入"的方法需要回去补答对应问题。':
    'Methods are routed by the rule engine from the task type; the AI explains why. You can remove or re-add methods. Methods marked "missing inputs" need answers first.',
  主方法: 'Primary',
  可选方法: 'Optional',
  条件已满足: 'Inputs ready',
  还缺输入: 'Missing inputs',
  已选用: 'Selected',
  选用此方法: 'Use this method',
  '为什么适用于你的目标：': 'Why it fits your goal: ',
  运行前需要: 'Required before it runs',
  补齐这些才能运行: 'Fill these to run it',
  回去补答: 'Go answer',
  '使用边界：': 'Usage boundary: ',
  需要准备的数据: 'Data to prepare',
  '每条数据都标了它要回答的问题、获取方式和服务的分析方法。':
    'Each item shows the question it answers, how to obtain it, and which method it serves.',
  'A · 不补就无法分析': 'A · Blocks analysis',
  'B · 提升分析质量': 'B · Improves quality',
  'C · 可选': 'C · Nice to have',
  '获取方式：': 'How to get it: ',
  返回补答: 'Back to answers',
  '{{count}} 个已选方法缺少输入，执行时会提示你补充': '{{count}} selected methods are missing inputs',
  开始运行分析方法: 'Run the analysis methods',

  // step 4
  逐个运行分析方法: 'Run each method',
  'AI 为每个方法生成候选内容，你来确认和修改；评分、关键路径等计算由代码完成，不由 AI 拍脑袋。':
    'The AI drafts candidate content for each method; you confirm and edit. Scores, critical paths, and rankings are computed by code, never guessed by the AI.',
  已生成: 'Generated',
  返回分析计划: 'Back to plan',
  '已完成 {{done}} / {{total}} 个方法': '{{done}} / {{total}} methods done',
  '正在生成行动路线…': 'Building the action route…',
  生成行动路线: 'Build action route',
  '正在生成…': 'Generating…',
  '重新生成候选内容（会覆盖当前修改）': 'Regenerate (overwrites your edits)',
  '可选：把相关资料贴在这里，AI 会结合它生成候选内容。':
    'Optional: paste related material here and the AI will use it for the draft.',
  'AI 正在生成候选内容…': 'The AI is drafting…',
  生成候选内容: 'Generate draft',

  // fishbone
  '下面所有原因都是候选假设，需要证据验证后才能当成结论。可以直接修改、增删。':
    'Every cause below is a candidate hypothesis that needs evidence. Edit, add, or delete freely.',
  要解释的问题: 'Problem to explain',
  删除类别: 'Delete category',
  删除原因: 'Delete cause',
  新类别: 'New category',
  加一条候选原因: 'Add a candidate cause',
  加一个类别: 'Add a category',
  '可选：贴入与问题相关的日志、访谈记录或数据摘要，候选原因会更贴近实际。':
    'Optional: paste logs, interview notes, or data summaries for more grounded candidate causes.',

  // mcda
  '打分是 0-10 的估计，权重合计应为 100。总分、排序和敏感性由代码计算，可随意改数字观察结论变化。':
    'Scores are 0-10 estimates and weights should sum to 100. Totals, ranking, and sensitivity are computed by code — change any number and watch the conclusion.',
  '准则（权重 / 最低可接受）': 'Criterion (weight / minimum)',
  删除方案: 'Delete option',
  删除准则: 'Delete criterion',
  权重: 'Weight',
  最低: 'Min',
  低于最低可接受: 'Below minimum',
  加权总分: 'Weighted total',
  '权重合计 {{sum}}': 'weights sum {{sum}}',
  方案: 'Option',
  加方案: 'Add option',
  新准则: 'New criterion',
  加准则: 'Add criterion',
  '敏感性提示：调整以下准则的权重 ±10 会改变第一名——结论对这些权重很敏感，请重点确认：':
    'Sensitivity: shifting these criteria by ±10 changes the winner — double-check their weights: ',
  '敏感性检查：任意单一准则权重 ±10 不会改变第一名，结论相对稳健。':
    'Sensitivity: no single criterion shifted by ±10 changes the winner. The conclusion is robust.',
  '可选：列出你已在考虑的候选方案和在乎的条件，AI 会据此搭好评分表草稿。':
    'Optional: list the options you are considering and what you care about; the AI drafts the scoring table.',

  // pert
  '三点估算单位为天（乐观 / 最可能 / 悲观）。期望工期、关键路径和浮动时间由代码计算；请按实际情况修正工期。':
    'Three-point estimates are in days (optimistic / likely / pessimistic). Expected durations, the critical path, and slack are computed by code — correct estimates to match reality.',
  '关键路径：': 'Critical path: ',
  '预计总工期 {{days}} 天': 'Estimated total: {{days}} days',
  '任务依赖存在循环，请检查"前置任务"设置。': 'A dependency cycle exists. Check the predecessors.',
  关键任务: 'Critical',
  '浮动 {{days}} 天': 'slack {{days}}d',
  删除任务: 'Delete task',
  乐观: 'Optimistic',
  最可能: 'Likely',
  悲观: 'Pessimistic',
  '期望 {{days}} 天': 'expected {{days}}d',
  '前置任务（点击切换）：': 'Predecessors (click to toggle):',
  暂无其他任务: 'No other tasks yet',
  任务: 'Task',
  加任务: 'Add task',
  '可选：列出你已经想到的任务、里程碑或截止时间，AI 会据此拆出任务和依赖。':
    'Optional: list tasks, milestones, or deadlines you already know; the AI drafts the breakdown.',

  // guided panels
  '把访谈记录、用户评论、笔记等原始材料贴在这里（每条一行效果更好），AI 会帮你归类。':
    'Paste raw material here — interviews, comments, notes (one per line works best) — and the AI will group them.',
  '可选：描述问题发生时的具体情况，追问链会更贴合事实。':
    'Optional: describe what actually happened when the problem occurred.',
  '可选：列出要排序的项目清单（如任务、功能、支出项）。':
    'Optional: list the items to rank (tasks, features, expenses).',
  '可选：描述你要检查的方案或计划。': 'Optional: describe the plan or option to stress-test.',
  '可选：描述当前流程的基线数据。': 'Optional: describe the current baseline metrics.',
  '可选：描述你想尝试的改动。': 'Optional: describe the change you want to try.',
  '可选：贴入你找到的历史数据或基准率。': 'Optional: paste historical data or base rates you found.',
  '可选：列出要评估的功能或支出项。': 'Optional: list the functions or expenses to evaluate.',
  '可选：列出你认为可能相关的因素。': 'Optional: list factors you suspect are related.',
  问题: 'Problem',
  '链条 {{index}}': 'Chain {{index}}',
  '为什么 {{index}}': 'Why {{index}}',
  '主题组：': 'Themes: ',
  新主题: 'New theme',
  加主题组: 'Add theme',
  未分类: 'Ungrouped',
  '价值口径（按什么排序）': 'Value metric (what to rank by)',
  '累计 {{pct}}%': 'cumulative {{pct}}%',
  删除条目: 'Delete item',
  加项目: 'Add item',
  变量: 'Variables',
  影响因素: 'Factor',
  结果: 'Outcome',
  混杂因素: 'Confounder',
  仅假设: 'Assumed',
  有证据: 'Evidence-backed',
  '关系（方向 = 前者影响后者）': 'Relations (direction: first affects second)',
  依据: 'Basis',
  必需: 'Essential',
  锦上添花: 'Nice to have',
  可削减: 'Cuttable',
  成本: 'Cost',
  价值判断: 'Worth',
  更省的替代: 'Cheaper alternative',
  '失效模式：可能怎样失败': 'Failure mode: how could it fail',
  影响: 'Effect',
  缓解措施: 'Mitigation',
  严重度: 'Severity',
  发生度: 'Occurrence',
  可探测度: 'Detection',
  '严重度 / 发生度 / 可探测度均为 1-10，RPN = 三者乘积，由代码计算排序。':
    'Severity / occurrence / detection are 1-10. RPN = product of the three, computed by code.',
  加失效模式: 'Add failure mode',
  '预测（改动后预期发生什么）': 'Prediction (what you expect after the change)',
  '试验范围（小而可停止）': 'Test scope (small and stoppable)',
  停止条件: 'Stop rule',
  下一轮怎么安排: 'Next cycle plan',
  观察指标: 'Metrics to watch',
  '预测陈述（可验证）': 'Prediction statement (verifiable)',
  '基准率（类似情况通常怎样；不知道就写缺失）': 'Base rate (what usually happens; state if unknown)',
  情景: 'Scenarios',
  '综合概率（%）': 'Overall probability (%)',
  验证时间: 'Resolve by',

  // step 5
  '每一步都标了来源方法和完成标准，可以直接勾选进度。当前最该做的是高亮的那一步。':
    'Every step shows its source method and completion criterion — check steps off as you go. The highlighted step is what to do now.',
  澄清: 'Clarify',
  收集: 'Collect',
  分析: 'Analyze',
  决策: 'Decide',
  行动: 'Act',
  复盘: 'Review',
  当前该做: 'Do now',
  '约 {{days}} 天': '~{{days}} days',
  标记为未完成: 'Mark as not done',
  标记为完成: 'Mark as done',
  返回分析执行: 'Back to analysis',

  // manual mode
  '离线规则模式：当前内容全部由本地规则模板生成，没有 AI 分析。配置好模型 API Key 后，':
    'Offline rule mode: everything here comes from local rule templates with no AI analysis. After configuring an LLM API key,',
  回到智能分析流程: 'return to the AI-driven flow',
  '不知道的字段可以先留空。': 'Leave unknown fields blank.',
  已保存到项目列表: 'Saved to the project list',
  删除: 'Delete',

  // new: app shell & navigation
  思径: 'Clarity',
  学习: 'Learn',
  方法库: 'Methods',
  场景训练: 'Practice',
  我的进度: 'My Progress',
  方法详情: 'Method Detail',
  '学会分析方法，自己做分析。': 'Master analysis methods, do your own analysis.',

  // new: methods page
  分析方法库: 'Analysis Methods',
  '掌握这些方法，学会什么场景用什么工具。点击任一方法，了解它的适用条件、步骤和常见误区。':
    'Master these methods and learn which tool fits which scenario. Click any method to learn when to use it, how it works, and common pitfalls.',
  全部: 'All',

  // new: method detail page
  方法不存在: 'Method not found',
  返回方法库: 'Back to methods',
  交互式: 'Interactive',
  引导式: 'Guided',
  什么时候用: 'When to use',
  运行步骤: 'How to use',
  '准备：': 'Prepare: ',
  '产出：': 'Output: ',
  使用边界与常见误区: 'Boundaries & common pitfalls',
  '想在真实场景中练习这个方法？': 'Want to practice this method in a real scenario?',
  '去场景训练中遇到需要用到这个方法的问题，在实践中加深理解。':
    'Try the scenario training to encounter problems that require this method and deepen your understanding through practice.',
  开始练习: 'Start practicing',

  // new: practice page
  '阅读场景，判断该用什么分析方法，写出你的思路。提交后获得反馈。':
    'Read the scenario, decide which method to use, write your reasoning. Get feedback after submission.',
  换一个: 'New scenario',
  '正在生成训练场景...': 'Generating training scenario...',
  加载场景失败请重试: 'Failed to load scenario. Try again.',
  入门: 'Beginner',
  进阶: 'Intermediate',
  挑战: 'Advanced',
  背景信息: 'Context',
  '你认为该用什么分析方法？': 'Which analysis method(s) should be used?',
  '可以选择一个或多个。先独立思考再选择。': 'You may select one or more. Think independently before choosing.',
  写出你的分析思路: 'Write your reasoning',
  '为什么选这个方法？你打算怎么用它？（可选但强烈建议填写，帮助你理清思路）':
    'Why this method? How would you apply it? (Optional but strongly recommended — helps you clarify your thinking)',
  '例如：这个场景的核心问题是...所以我选择...因为...':
    'Example: The core issue in this scenario is... so I choose... because...',
  提交答案: 'Submit',
  判断正确: 'Correct',
  需要调整: 'Needs adjustment',
  方法适配分析: 'Method fit analysis',
  适合: 'Good fit',
  部分适合: 'Partial fit',
  不太合适: 'Poor fit',
  下次记住: 'Remember for next time',
  常见误区: 'Common mistakes',
  下一个场景: 'Next scenario',
  提交失败请重试: 'Submission failed. Try again.',
  '加载场景失败，请重试。': 'Failed to load scenario. Please try again.',
  '提交失败，请重试。': 'Submission failed. Please try again.',

  // new: progress page
  '追踪你的学习情况，了解哪些场景类型和方法你已经掌握，哪些还需要练习。':
    'Track your learning progress. See which scenario types and methods you have mastered and which need more practice.',
  总练习: 'Total practices',
  正确率: 'Accuracy',
  正确数: 'Correct',
  最近练习: 'Last practiced',
  暂无: 'None yet',
  '还没有练习记录。去场景训练开始你的第一次练习吧！':
    'No practice records yet. Start your first practice in scenario training!',
  按场景类型: 'By scenario type',
  按方法使用: 'By method used',
}

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, variables?: Variables) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)
const storageKey = 'analysis-language'

function getStoredLanguage(): Language {
  return localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh-CN'
}

function interpolate(text: string, variables?: Variables) {
  if (!variables) return text
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        localStorage.setItem(storageKey, nextLanguage)
        setLanguageState(nextLanguage)
      },
      t(key, variables) {
        return interpolate(language === 'en' ? (english[key] ?? key) : key, variables)
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
